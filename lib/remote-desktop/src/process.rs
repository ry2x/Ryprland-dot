// SPDX-FileCopyrightText: 2026 Ry2X
// SPDX-License-Identifier: GPL-3.0-or-later

use anyhow::{Context, Result, bail};
use nix::errno::Errno;
use nix::fcntl::{FcntlArg, OFlag, fcntl};
use nix::poll::{PollFd, PollFlags, poll};
use nix::sys::signal::{Signal, kill};
use nix::unistd::Pid;
use std::io::{ErrorKind, Read};
use std::os::fd::AsFd;
use std::process::{Child, Command, ExitStatus, Stdio};
use std::thread;
use std::time::{Duration, Instant};

/// Reap the child on every exit path, including command/IPC errors.
pub struct ManagedChild(pub Child);

impl ManagedChild {
    pub fn terminate(&mut self) -> Result<()> {
        if self.0.try_wait()?.is_none() {
            match kill(Pid::from_raw(self.0.id() as i32), Signal::SIGTERM) {
                Ok(()) | Err(Errno::ESRCH) => {}
                Err(error) => return Err(error.into()),
            }
        }
        Ok(())
    }

    pub fn finish(&mut self) -> Result<ExitStatus> {
        self.terminate()?;
        let deadline = Instant::now() + Duration::from_secs(10);
        loop {
            if let Some(status) = self.0.try_wait()? {
                return Ok(status);
            }
            if Instant::now() >= deadline {
                self.0.kill()?;
                return Ok(self.0.wait()?);
            }
            thread::sleep(Duration::from_millis(20));
        }
    }
}

impl Drop for ManagedChild {
    fn drop(&mut self) {
        if self.0.try_wait().ok().flatten().is_none() {
            let _ = self.0.kill();
            let _ = self.0.wait();
        }
    }
}

pub fn nonblocking(fd: impl AsFd) -> Result<()> {
    let flags = OFlag::from_bits_truncate(fcntl(&fd, FcntlArg::F_GETFL)?);
    fcntl(&fd, FcntlArg::F_SETFL(flags | OFlag::O_NONBLOCK))?;
    Ok(())
}

pub fn wait_readable(fd: impl AsFd, milliseconds: u16) -> Result<()> {
    let mut fds = [PollFd::new(fd.as_fd(), PollFlags::POLLIN)];
    match poll(&mut fds, milliseconds) {
        Ok(_) | Err(Errno::EINTR) => Ok(()),
        Err(error) => Err(error.into()),
    }
}

fn drain(reader: &mut impl Read, output: &mut Vec<u8>) -> Result<bool> {
    let mut buffer = [0; 4096];
    loop {
        match reader.read(&mut buffer) {
            Ok(0) => return Ok(true),
            Ok(count) => {
                // IPC replies are small; bound memory if a command misbehaves.
                if output.len() + count > 1024 * 1024 {
                    bail!("Command output exceeded 1 MiB");
                }
                output.extend_from_slice(&buffer[..count]);
            }
            Err(error) if error.kind() == ErrorKind::WouldBlock => return Ok(false),
            Err(error) if error.kind() == ErrorKind::Interrupted => continue,
            Err(error) => return Err(error.into()),
        }
    }
}

pub fn run(program: &str, args: &[&str]) -> Result<String> {
    run_with_timeout(program, args, Duration::from_secs(10))
}

pub fn run_with_timeout(program: &str, args: &[&str], timeout: Duration) -> Result<String> {
    let mut child = ManagedChild(
        Command::new(program)
            .args(args)
            .stdout(Stdio::piped())
            .stderr(Stdio::piped())
            .spawn()
            .with_context(|| format!("Starting {program}"))?,
    );
    let mut stdout = child.0.stdout.take().context("Missing command stdout")?;
    let mut stderr = child.0.stderr.take().context("Missing command stderr")?;
    nonblocking(&stdout)?;
    nonblocking(&stderr)?;
    let mut output = Vec::new();
    let mut errors = Vec::new();
    let deadline = Instant::now() + timeout;
    loop {
        let out_done = drain(&mut stdout, &mut output)?;
        let err_done = drain(&mut stderr, &mut errors)?;
        if let Some(status) = child.0.try_wait()?
            && out_done
            && err_done
        {
            let output = String::from_utf8_lossy(&output).into_owned();
            if !status.success() {
                let errors = String::from_utf8_lossy(&errors);
                bail!(
                    "{program}: {}",
                    if errors.trim().is_empty() {
                        output.trim()
                    } else {
                        errors.trim()
                    }
                );
            }
            return Ok(output);
        }
        if Instant::now() >= deadline {
            bail!("{program}: command timed out");
        }
        let mut fds = Vec::with_capacity(2);
        if !out_done {
            fds.push(PollFd::new(stdout.as_fd(), PollFlags::POLLIN));
        }
        if !err_done {
            fds.push(PollFd::new(stderr.as_fd(), PollFlags::POLLIN));
        }
        if fds.is_empty() {
            thread::sleep(Duration::from_millis(10));
        } else {
            match poll(&mut fds, 20_u16) {
                Ok(_) | Err(Errno::EINTR) => {}
                Err(error) => return Err(error.into()),
            }
        }
    }
}
