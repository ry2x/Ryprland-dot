// SPDX-FileCopyrightText: 2026 Ry2X
// SPDX-License-Identifier: GPL-3.0-or-later

use crate::process;
use anyhow::{Context, Result, bail};
use nix::time::{ClockId, clock_gettime};
use serde::{Deserialize, Serialize};
use serde_json::{Value, json};
use std::collections::BTreeMap;
use std::env;
use std::fs::{self, DirBuilder, File, OpenOptions, TryLockError};
use std::io::{ErrorKind, Write};
use std::os::unix::fs::{DirBuilderExt, OpenOptionsExt};
use std::path::{Path, PathBuf};
use std::thread;
use std::time::{Duration, Instant};

pub const OUTPUT: &str = "RMT-1";

pub fn remote_options() -> BTreeMap<String, Value> {
    [
        ("misc.mouse_move_enables_dpms", json!(false)),
        ("misc.key_press_enables_dpms", json!(false)),
        ("cursor.no_warps", json!(true)),
        ("cursor.warp_on_change_workspace", json!(0)),
        ("cursor.warp_on_toggle_special", json!(0)),
        ("binds.window_direction_monitor_fallback", json!(false)),
    ]
    .into_iter()
    .map(|(key, value)| (key.to_owned(), value))
    .collect()
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Position {
    pub x: f64,
    pub y: f64,
}

#[derive(Clone, Debug, Deserialize, Serialize, PartialEq)]
pub struct Monitor {
    pub name: String,
    #[serde(rename = "dpmsStatus")]
    pub dpms: bool,
    pub x: f64,
    pub y: f64,
    pub width: f64,
    pub height: f64,
    pub scale: f64,
    pub focused: bool,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
pub struct State {
    pub options: BTreeMap<String, Value>,
    pub monitors: BTreeMap<String, bool>,
    pub focus: Option<String>,
    pub cursor: Position,
    pub sessions: usize,
    // Linux CLOCK_MONOTONIC is shared across processes and Python's monotonic().
    pub pending_since: f64,
}

pub fn monotonic() -> Result<f64> {
    let now = clock_gettime(ClockId::CLOCK_MONOTONIC)?;
    Ok(now.tv_sec() as f64 + now.tv_nsec() as f64 / 1e9)
}

pub trait Backend {
    fn query(&self, args: &[&str]) -> Result<Value>;
    fn evaluate(&self, code: &str) -> Result<()>;
    fn run(&self, program: &str, args: &[&str]) -> Result<()>;
}

pub struct Hyprland;

impl Backend for Hyprland {
    fn query(&self, args: &[&str]) -> Result<Value> {
        let mut command = vec!["-j"];
        command.extend_from_slice(args);
        Ok(serde_json::from_str(&process::run("hyprctl", &command)?)?)
    }

    fn evaluate(&self, code: &str) -> Result<()> {
        let result = process::run("hyprctl", &["eval", code])?;
        // Lua errors can still produce a successful hyprctl exit status.
        if result.trim() != "ok" {
            bail!("Hyprland Lua: {}", result.trim());
        }
        Ok(())
    }

    fn run(&self, program: &str, args: &[&str]) -> Result<()> {
        process::run(program, args)?;
        Ok(())
    }
}

pub fn lua(value: &Value) -> String {
    match value {
        Value::Object(values) => format!(
            "{{{}}}",
            values
                .iter()
                .map(|(key, value)| format!("[{}] = {}", lua(&json!(key)), lua(value)))
                .collect::<Vec<_>>()
                .join(", ")
        ),
        Value::String(value) => {
            // JSON \uXXXX escapes are not valid Lua escapes. Encode control bytes
            // as three-digit decimal escapes; preserve UTF-8 without interpolation.
            let mut quoted = String::from("\"");
            for character in value.chars() {
                match character {
                    '"' => quoted.push_str("\\\""),
                    '\\' => quoted.push_str("\\\\"),
                    c if c.is_control() && u32::from(c) <= 127 => {
                        quoted.push_str(&format!("\\{:03}", u32::from(c)))
                    }
                    c => quoted.push(c),
                }
            }
            quoted.push('"');
            quoted
        }
        Value::Null => "nil".to_owned(),
        _ => value.to_string(),
    }
}

pub struct Desktop<B: Backend> {
    pub backend: B,
    pub directory: PathBuf,
}

impl Desktop<Hyprland> {
    pub fn from_environment() -> Result<Self> {
        let instance = env::var("HYPRLAND_INSTANCE_SIGNATURE")
            .context("Missing HYPRLAND_INSTANCE_SIGNATURE")?;
        let runtime = env::var_os("XDG_RUNTIME_DIR").context("Missing XDG_RUNTIME_DIR")?;
        Self::new(
            Hyprland,
            Path::new(&runtime).join(format!("ryprland-remote-desktop-{instance}")),
        )
    }
}

impl<B: Backend> Desktop<B> {
    pub fn new(backend: B, directory: PathBuf) -> Result<Self> {
        DirBuilder::new()
            .recursive(true)
            .mode(0o700)
            .create(&directory)?;
        Ok(Self { backend, directory })
    }

    fn path(&self) -> PathBuf {
        self.directory.join("state.json")
    }

    pub fn locked(&self) -> Result<File> {
        let lock = OpenOptions::new()
            .append(true)
            .create(true)
            .mode(0o600)
            .open(self.directory.join("lock"))?;
        let deadline = Instant::now() + Duration::from_secs(10);
        loop {
            match lock.try_lock() {
                Ok(()) => return Ok(lock), // Closing the file releases flock.
                Err(TryLockError::WouldBlock) if Instant::now() < deadline => {
                    thread::sleep(Duration::from_millis(50))
                }
                Err(TryLockError::WouldBlock) => {
                    bail!("Timed out waiting for remote desktop state")
                }
                Err(TryLockError::Error(error)) => return Err(error.into()),
            }
        }
    }

    pub fn read(&self) -> Result<Option<State>> {
        match fs::read(self.path()) {
            Ok(bytes) => Ok(Some(
                serde_json::from_slice(&bytes).context("Reading remote desktop state")?,
            )),
            Err(error) if error.kind() == ErrorKind::NotFound => Ok(None),
            Err(error) => Err(error.into()),
        }
    }

    pub fn write(&self, state: &State) -> Result<()> {
        let mut temporary = tempfile::NamedTempFile::new_in(&self.directory)?;
        serde_json::to_writer(&mut temporary, state)?;
        temporary.flush()?;
        temporary.persist(self.path())?;
        Ok(())
    }

    fn monitors(&self) -> Result<Vec<Monitor>> {
        Ok(serde_json::from_value(self.backend.query(&["monitors"])?)?)
    }

    fn configure(&self, options: &BTreeMap<String, Value>) -> Result<()> {
        let mut categories = serde_json::Map::new();
        for (key, value) in options {
            let (category, option) = key.split_once('.').context("Invalid Hyprland option")?;
            categories
                .entry(category)
                .or_insert_with(|| json!({}))
                .as_object_mut()
                .context("Invalid option category")?
                .insert(option.to_owned(), value.clone());
        }
        self.backend
            .evaluate(&format!("hl.config({})", lua(&Value::Object(categories))))
    }

    fn dpms(&self, name: &str, enabled: bool) -> Result<()> {
        self.backend.evaluate(&format!(
            "hl.dispatch(hl.dsp.dpms({}))",
            lua(&json!({"monitor": name, "action": if enabled { "enable" } else { "disable" }}))
        ))
    }

    fn focus(&self, name: &str, cursor: &Position) -> Result<()> {
        self.backend.evaluate(&format!(
            "hl.dispatch(hl.dsp.focus({})); hl.dispatch(hl.dsp.cursor.move({}))",
            lua(&json!({"monitor": name})),
            lua(&serde_json::to_value(cursor)?)
        ))
    }

    pub fn prepare(&self) -> Result<()> {
        let _lock = self.locked()?;
        let monitors = self.monitors()?;
        let local = monitors.iter().find(|monitor| monitor.focused);
        let cursor = serde_json::from_value(self.backend.query(&["cursorpos"])?)?;
        if !monitors.iter().any(|monitor| monitor.name == OUTPUT) {
            self.backend
                .run("hyprctl", &["output", "create", "headless", OUTPUT])?;
        }
        self.backend.evaluate(&format!("hl.monitor({})", lua(&json!({"output": OUTPUT, "mode": "1920x1080@60", "scale": 1, "position": "10000x10000"}))))?;
        for _ in 0..50 {
            if self
                .monitors()?
                .iter()
                .any(|monitor| monitor.name == OUTPUT && monitor.width > 0.0)
            {
                if let Some(local) = local {
                    self.focus(&local.name, &cursor)?;
                }
                return Ok(());
            }
            thread::sleep(Duration::from_millis(100));
        }
        bail!("Remote output did not become ready");
    }

    fn enforce(&self, state: &mut State) -> Result<()> {
        self.configure(&remote_options())?;
        for monitor in self.monitors()? {
            if monitor.name != OUTPUT && !state.monitors.contains_key(&monitor.name) {
                state.monitors.insert(monitor.name.clone(), monitor.dpms);
                self.write(state)?; // Save hotplugged displays before switching them off.
            }
            let enabled = monitor.name == OUTPUT;
            if monitor.dpms != enabled {
                self.dpms(&monitor.name, enabled)?;
            }
        }
        Ok(())
    }

    pub fn enter(&self) -> Result<()> {
        let _lock = self.locked()?;
        let monitors = self.monitors()?;
        let remote = monitors
            .iter()
            .find(|monitor| monitor.name == OUTPUT)
            .context("Remote output is missing; run --prepare first")?;
        if let Some(mut state) = self.read()? {
            return self.enforce(&mut state);
        }
        let mut options = BTreeMap::new();
        for key in remote_options().keys() {
            let option = self
                .backend
                .query(&["getoption", &key.replacen('.', ":", 1)])?;
            let value = option
                .get("bool")
                .filter(|v| v.is_boolean())
                .or_else(|| option.get("int").filter(|v| v.is_i64()))
                .context("Missing Hyprland option value")?;
            options.insert(key.clone(), value.clone());
        }
        let mut state = State {
            options,
            monitors: monitors
                .iter()
                .filter(|monitor| monitor.name != OUTPUT)
                .map(|monitor| (monitor.name.clone(), monitor.dpms))
                .collect(),
            focus: monitors
                .iter()
                .find(|monitor| monitor.focused)
                .map(|monitor| monitor.name.clone()),
            cursor: serde_json::from_value(self.backend.query(&["cursorpos"])?)?,
            sessions: 0,
            pending_since: monotonic()?,
        };
        self.write(&state)?;
        let mut enter = || -> Result<()> {
            self.enforce(&mut state)?;
            self.focus(
                OUTPUT,
                &Position {
                    x: remote.x + remote.width / remote.scale / 2.0,
                    y: remote.y + remote.height / remote.scale / 2.0,
                },
            )
        };
        if let Err(error) = enter() {
            if let Err(restore_error) = self.restore_locked() {
                return Err(error.context(format!("Rollback also failed: {restore_error:#}")));
            }
            return Err(error);
        }
        Ok(())
    }

    pub fn sessions(&self, count: usize) -> Result<()> {
        let _lock = self.locked()?;
        if let Some(mut state) = self.read()? {
            state.sessions = count;
            self.write(&state)?;
        }
        Ok(())
    }

    fn restore_locked(&self) -> Result<()> {
        let Some(state) = self.read()? else {
            return Ok(());
        };
        let monitors = self.monitors()?;
        // Restore the cursor before re-enabling automatic wake-up.
        if let Some(name) = state
            .focus
            .as_deref()
            .filter(|name| monitors.iter().any(|m| m.name == *name))
        {
            self.focus(name, &state.cursor)?;
        } else if let Some(local) = monitors.iter().find(|monitor| monitor.name != OUTPUT) {
            self.focus(
                &local.name,
                &Position {
                    x: local.x + 100.0,
                    y: local.y + 100.0,
                },
            )?;
        }
        for (name, enabled) in state.monitors {
            if monitors.iter().any(|monitor| monitor.name == name) {
                self.dpms(&name, enabled)?;
            }
        }
        self.configure(&state.options)?;
        fs::remove_file(self.path())?;
        Ok(())
    }

    pub fn restore(&self, only_idle: bool) -> Result<()> {
        let _lock = self.locked()?;
        if !only_idle || self.read()?.is_none_or(|state| state.sessions == 0) {
            self.restore_locked()?;
        }
        Ok(())
    }

    pub fn sync(&self) -> Result<()> {
        let _lock = self.locked()?;
        if let Some(mut state) = self.read()? {
            if state.sessions == 0 && monotonic()? - state.pending_since > 30.0 {
                self.restore_locked()?;
            } else {
                self.enforce(&mut state)?;
            }
        }
        Ok(())
    }

    pub fn idle(&self, action: &str) -> Result<()> {
        let _lock = self.locked()?;
        if let Some(mut state) = self.read()? {
            return self.enforce(&mut state);
        }
        match action {
            "wake" | "idle-off" => {
                for monitor in self.monitors()? {
                    self.dpms(&monitor.name, action == "wake" || monitor.name == OUTPUT)?;
                }
            }
            "idle-dim" => self.backend.run(
                "ags",
                &["request", "-i", "rystal-shell", "brightness", "set", "0"],
            )?,
            "idle-brightness" => self
                .backend
                .run("ags", &["request", "-i", "rystal-shell", "brightness", "r"])?,
            "idle-suspend" => {
                // Keep Rystal-shell's caffeine-remote check in the original hook.
                let script = home()?.join(".config/hypr/scripts/suspend.sh");
                self.backend
                    .run(script.to_str().context("Non-UTF-8 suspend path")?, &[])?;
            }
            _ => bail!("Unknown idle action: {action}"),
        }
        Ok(())
    }

    pub fn remove_output(&self) -> Result<()> {
        let _lock = self.locked()?;
        let monitors = self.monitors()?;
        if monitors.iter().any(|monitor| monitor.name == OUTPUT)
            && monitors.iter().any(|monitor| monitor.name != OUTPUT)
        {
            self.backend.run("hyprctl", &["output", "remove", OUTPUT])?;
        }
        Ok(())
    }

    pub fn status(&self) -> Result<Value> {
        let _lock = self.locked()?;
        let state = self.read()?;
        Ok(
            json!({"mode": if state.is_some() {"streaming"} else {"standby"}, "sessions": state.map_or(0, |state| state.sessions)}),
        )
    }
}

pub fn home() -> Result<PathBuf> {
    Ok(env::var_os("HOME").context("Missing HOME")?.into())
}
