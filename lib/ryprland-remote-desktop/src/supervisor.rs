// SPDX-FileCopyrightText: 2026 Ry2X
// SPDX-License-Identifier: GPL-3.0-or-later

use crate::desktop::{Backend, Desktop, OUTPUT, home};
use crate::process::{ManagedChild, nonblocking, wait_readable};
use anyhow::{Context, Result};
use nix::fcntl::OFlag;
use nix::unistd::pipe2;
use serde_json::{Value, json};
use signal_hook::consts::{SIGINT, SIGTERM};
use std::env;
use std::fs::{self, File};
use std::io::{ErrorKind, Read, Write};
use std::path::Path;
use std::process::{Command, Stdio};
use std::sync::{
    Arc,
    atomic::{AtomicBool, Ordering},
};
use std::time::{Duration, Instant};

pub trait Lifecycle {
    fn enter(&self) -> Result<()>;
    fn sessions(&self, count: usize) -> Result<()>;
    fn restore(&self) -> Result<()>;
    fn sync(&self) -> Result<()>;
}

impl<B: Backend> Lifecycle for Desktop<B> {
    fn enter(&self) -> Result<()> {
        self.enter()
    }
    fn sessions(&self, count: usize) -> Result<()> {
        self.sessions(count)
    }
    fn restore(&self) -> Result<()> {
        self.restore(false)
    }
    fn sync(&self) -> Result<()> {
        self.sync()
    }
}

#[derive(Default)]
pub struct Streaming {
    pub count: usize,
}

impl Streaming {
    pub fn message(&mut self, desktop: &impl Lifecycle, level: &str, message: &str) -> Result<()> {
        let started = message
            .strip_prefix("New streaming session started [active sessions: ")
            .and_then(|value| value.strip_suffix(']'))
            .is_some_and(|value| {
                !value.is_empty() && value.bytes().all(|byte| byte.is_ascii_digit())
            });
        if level == "Info" && started {
            if self.count == 0 {
                desktop.enter()?;
            }
            self.count += 1;
            desktop.sessions(self.count)?;
        } else if (level == "Debug" && message == "Session ended")
            || (level == "Error" && message == "Failed to start a streaming session")
        {
            self.count = self.count.saturating_sub(1);
            desktop.sessions(self.count)?;
            if self.count == 0 {
                desktop.restore()?;
            }
        }
        Ok(())
    }
}

pub fn preparation_commands(config: &str, hook: &Path) -> Result<Value> {
    let mut existing = Vec::new();
    let mut offset = 0;
    for line in config.split_inclusive('\n') {
        if let Some((key, _)) = line.trim_start().split_once('=')
            && key.trim() == "global_prep_cmd"
        {
            let equals = line.find('=').context("Missing preparation assignment")?;
            let value = serde_json::Deserializer::from_str(&config[offset + equals + 1..])
                .into_iter::<Value>()
                .next()
                .context("Missing global_prep_cmd value")??;
            existing = value
                .as_array()
                .context("Sunshine global_prep_cmd must be a JSON list")?
                .clone();
            break;
        }
        offset += line.len();
    }
    let hook = hook.to_str().context("Non-UTF-8 preparation hook")?;
    // Match the previous shlex.quote behavior: Boost.Process treats quotes on a
    // simple executable path literally, so ordinary paths must remain unquoted.
    let quoted = if !hook.is_empty()
        && hook
            .bytes()
            .all(|byte| byte.is_ascii_alphanumeric() || b"_@%+=:,./-".contains(&byte))
    {
        hook.to_owned()
    } else {
        format!("'{}'", hook.replace('\'', "'\\''"))
    };
    let mut commands = vec![
        json!({"do": format!("{quoted} --enter"), "undo": format!("{quoted} --release"), "elevated": false}),
    ];
    commands.extend(existing);
    Ok(json!(commands))
}

pub fn sunshine_command() -> Result<Command> {
    let config_home = env::var_os("XDG_CONFIG_HOME")
        .map(Into::into)
        .unwrap_or(home()?.join(".config"));
    let config = match fs::read_to_string(config_home.join("sunshine/sunshine.conf")) {
        Ok(config) => config,
        Err(error) if error.kind() == ErrorKind::NotFound => String::new(),
        Err(error) => return Err(error.into()),
    };
    let hook = env::var_os("REMOTE_DESKTOP_HOOK")
        .map(Into::into)
        .unwrap_or(home()?.join(".local/bin/remote-desktop.sh"));
    command_for_config(&config, &hook)
}

pub fn command_for_config(config: &str, hook: &Path) -> Result<Command> {
    let mut command = Command::new("/usr/bin/sunshine");
    command.args([
        format!("output_name={OUTPUT}"),
        "capture=wlr".to_owned(),
        "min_log_level=debug".to_owned(),
        "log_path=/dev/null".to_owned(),
        // Tray callbacks synchronously enter Qt and can block RTSP
        // startup/teardown while waiting for the desktop portal.
        "system_tray=disabled".to_owned(),
        format!("global_prep_cmd={}", preparation_commands(config, hook)?),
    ]);
    Ok(command)
}

pub fn strip_ansi(text: &str) -> String {
    let mut result = String::with_capacity(text.len());
    let mut characters = text.chars().peekable();
    while let Some(character) = characters.next() {
        if character == '\u{1b}' && characters.peek() == Some(&'[') {
            characters.next();
            for code in characters.by_ref() {
                if ('@'..='~').contains(&code) {
                    break;
                }
            }
        } else {
            result.push(character);
        }
    }
    result
}

pub fn parse_log(text: &str) -> Option<(&str, &str)> {
    let (_, text) = text.strip_prefix('[')?.split_once("]: ")?;
    let (level, message) = text.split_once(": ")?;
    matches!(
        level,
        "Verbose" | "Debug" | "Info" | "Warning" | "Error" | "Fatal"
    )
    .then_some((level, message))
}

/// Drop oversized/unknown lines and keep partial-line memory bounded.
#[derive(Default)]
pub struct LogBuffer {
    line: Vec<u8>,
    discarding: bool,
}

impl LogBuffer {
    pub fn feed(
        &mut self,
        bytes: &[u8],
        mut process: impl FnMut(&str) -> Result<()>,
    ) -> Result<()> {
        for &byte in bytes {
            if byte == b'\n' {
                if !self.discarding {
                    let text = String::from_utf8_lossy(&self.line);
                    process(text.trim_end_matches('\r'))?;
                }
                self.line.clear();
                self.discarding = false;
            } else if !self.discarding {
                if self.line.len() == 65536 {
                    self.line.clear();
                    self.discarding = true;
                } else {
                    self.line.push(byte);
                }
            }
        }
        Ok(())
    }

    fn finish(&mut self, process: impl FnMut(&str) -> Result<()>) -> Result<()> {
        self.feed(b"\n", process)
    }
}

struct Signals {
    received: Arc<AtomicBool>,
    registrations: Vec<signal_hook::SigId>,
}

impl Signals {
    fn new() -> Result<Self> {
        let mut signals = Self {
            received: Arc::new(AtomicBool::new(false)),
            registrations: Vec::new(),
        };
        for number in [SIGTERM, SIGINT] {
            signals.registrations.push(signal_hook::flag::register(
                number,
                Arc::clone(&signals.received),
            )?);
        }
        Ok(signals)
    }
}

impl Drop for Signals {
    fn drop(&mut self) {
        for registration in self.registrations.drain(..) {
            signal_hook::low_level::unregister(registration);
        }
    }
}

pub fn serve(
    desktop: &impl Lifecycle,
    mut command: Command,
    output: &mut impl Write,
) -> Result<i32> {
    let signals = Signals::new()?;
    let (reader, writer) = pipe2(OFlag::O_CLOEXEC)?;
    let mut reader = File::from(reader);
    nonblocking(&reader)?;
    command
        .stdout(Stdio::from(writer.try_clone()?))
        .stderr(Stdio::from(writer));
    let spawn = command.spawn();
    drop(command); // Close the parent's write ends so EOF is observable.
    let mut child = match spawn {
        Ok(child) => ManagedChild(child),
        Err(error) => {
            desktop.restore()?;
            return Err(error.into());
        }
    };
    let result = supervise(desktop, &mut child, &mut reader, &signals, output);
    // Cleanup executes even when parsing, IPC, logging or supervision fails.
    let termination = child.finish();
    let restoration = desktop.restore();
    match result {
        Err(error) => {
            if let Err(restore_error) = restoration {
                return Err(error.context(format!("Restoration also failed: {restore_error:#}")));
            }
            Err(error)
        }
        Ok(code) => {
            termination?;
            restoration?;
            Ok(code)
        }
    }
}

fn supervise(
    desktop: &impl Lifecycle,
    child: &mut ManagedChild,
    reader: &mut File,
    signals: &Signals,
    output: &mut impl Write,
) -> Result<i32> {
    let mut streaming = Streaming::default();
    let mut buffer = LogBuffer::default();
    let mut bytes = [0; 4096];
    let mut next_sync = Instant::now() + Duration::from_secs(1);
    let mut exited_since = None;
    let mut terminating_since = None;
    let mut eof = false;
    loop {
        if signals.received.load(Ordering::Relaxed) && terminating_since.is_none() {
            child.terminate()?;
            terminating_since = Some(Instant::now());
        }
        if terminating_since
            .is_some_and(|since: Instant| since.elapsed() >= Duration::from_secs(10))
            && child.0.try_wait()?.is_none()
        {
            child.0.kill()?;
        }
        wait_readable(&*reader, 200)?;
        let mut process = |line: &str| -> Result<()> {
            let text = strip_ansi(line);
            if let Some((level, message)) = parse_log(&text) {
                streaming.message(desktop, level, message)?;
                // Debug requests contain pairing/input keys. Never persist them.
                if !matches!(level, "Verbose" | "Debug") {
                    writeln!(output, "{text}")?;
                    output.flush()?;
                }
            }
            Ok(())
        };
        match reader.read(&mut bytes) {
            Ok(0) => {
                if !eof {
                    buffer.finish(&mut process)?;
                    eof = true;
                }
            }
            Ok(count) => buffer.feed(&bytes[..count], &mut process)?,
            Err(error)
                if matches!(error.kind(), ErrorKind::WouldBlock | ErrorKind::Interrupted) => {}
            Err(error) => return Err(error.into()),
        }
        if Instant::now() >= next_sync {
            desktop.sync()?;
            next_sync = Instant::now() + Duration::from_secs(1);
        }
        if let Some(status) = child.0.try_wait()? {
            let since = exited_since.get_or_insert_with(Instant::now);
            if eof || since.elapsed() >= Duration::from_secs(1) {
                let code = status.code().unwrap_or(1);
                writeln!(output, "Remote desktop: Sunshine exited with status {code}")?;
                return Ok(code);
            }
        } else if eof {
            // A live process with closed log pipes must not cause a busy loop.
            std::thread::sleep(Duration::from_millis(200));
        }
    }
}
