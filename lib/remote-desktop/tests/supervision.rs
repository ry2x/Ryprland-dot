// SPDX-FileCopyrightText: 2026 Ry2X
// SPDX-License-Identifier: GPL-3.0-or-later

use anyhow::{Result, bail};
use remote_desktop::{
    desktop::lua,
    process::run_with_timeout,
    supervisor::{self, Lifecycle, LogBuffer},
};
use serde_json::json;
use std::cell::RefCell;
use std::path::Path;
use std::process::Command;
use std::time::{Duration, Instant};

#[derive(Default)]
struct FakeDesktop {
    events: RefCell<Vec<String>>,
    fail_entry: bool,
}

impl Lifecycle for FakeDesktop {
    fn enter(&self) -> Result<()> {
        self.events.borrow_mut().push("enter".into());
        if self.fail_entry {
            bail!("IPC unavailable");
        }
        Ok(())
    }
    fn sessions(&self, count: usize) -> Result<()> {
        self.events.borrow_mut().push(count.to_string());
        Ok(())
    }
    fn restore(&self) -> Result<()> {
        self.events.borrow_mut().push("restore".into());
        Ok(())
    }
    fn sync(&self) -> Result<()> {
        Ok(())
    }
}

#[test]
fn existing_preparation_hooks_and_shell_quoting_are_preserved() {
    let config = "# global_prep_cmd = ignored\nglobal_prep_cmd = [\n{\"do\": \"echo existing\", \"undo\": \"echo undo\"}\n]\nother = value\n";
    let commands = supervisor::preparation_commands(config, Path::new("/tmp/a'b hook.sh")).unwrap();
    assert_eq!(
        commands[1],
        json!({"do":"echo existing", "undo":"echo undo"})
    );
    assert_eq!(commands[0]["do"], "'/tmp/a'\\''b hook.sh' --enter");
    assert!(
        supervisor::preparation_commands("global_prep_cmd = {}", Path::new("/tmp/hook")).is_err()
    );
    let commands = supervisor::preparation_commands("", Path::new("/tmp/hook.sh")).unwrap();
    assert_eq!(commands[0]["do"], "/tmp/hook.sh --enter");
}

#[test]
fn real_child_exit_restores_state_and_does_not_persist_keys() {
    let desktop = FakeDesktop::default();
    let mut command = Command::new("sh");
    command.args(["-c", "printf '%s\\n' '[2026]: Debug: rikey -- PRIVATE_TEST_KEY' '[2026]: Info: New streaming session started [active sessions: 1]' '[2026]: Info: CLIENT DISCONNECTED' '[2026]: Debug: Session ended' '[2026]: Info: New streaming session started [active sessions: 1]' '[2026]: Fatal: Unexpected exit'; exit 7"]);
    let mut output = Vec::new();
    assert_eq!(
        supervisor::serve(&desktop, command, &mut output).unwrap(),
        7
    );
    assert_eq!(
        *desktop.events.borrow(),
        ["enter", "1", "0", "restore", "enter", "1", "restore"]
    );
    let output = String::from_utf8(output).unwrap();
    assert!(!output.contains("PRIVATE_TEST_KEY"));
    assert!(!output.contains("Debug:"));
    assert!(output.contains("Unexpected exit"));
}

#[test]
fn supervisor_ipc_error_terminates_child_and_restores() {
    let desktop = FakeDesktop {
        fail_entry: true,
        ..Default::default()
    };
    let mut command = Command::new("sh");
    command.args(["-c", "printf '%s\\n' '[2026]: Info: New streaming session started [active sessions: 1]'; exec sleep 60"]);
    let start = Instant::now();
    assert!(supervisor::serve(&desktop, command, &mut Vec::new()).is_err());
    assert!(start.elapsed() < Duration::from_secs(5));
    assert_eq!(*desktop.events.borrow(), ["enter", "restore"]);
}

#[test]
fn command_timeout_reaps_child_and_stderr_is_reported() {
    let start = Instant::now();
    assert!(run_with_timeout("sh", &["-c", "exec sleep 60"], Duration::from_millis(100)).is_err());
    assert!(start.elapsed() < Duration::from_secs(2));
    let error = run_with_timeout(
        "sh",
        &["-c", "echo failure >&2; exit 5"],
        Duration::from_secs(1),
    )
    .unwrap_err();
    assert!(error.to_string().contains("failure"));
}

#[test]
fn split_ansi_logs_and_oversized_debug_lines_are_bounded() {
    let mut buffer = LogBuffer::default();
    let mut lines = Vec::new();
    buffer
        .feed(b"\x1b[32m[2026]: In", |line| {
            lines.push(line.to_owned());
            Ok(())
        })
        .unwrap();
    buffer
        .feed(b"fo: Ready\x1b[0m\r\n", |line| {
            lines.push(supervisor::strip_ansi(line));
            Ok(())
        })
        .unwrap();
    buffer
        .feed(&vec![b'x'; 70000], |_| panic!("No newline yet"))
        .unwrap();
    buffer
        .feed(b"\n[2026]: Info: Next\n", |line| {
            lines.push(line.to_owned());
            Ok(())
        })
        .unwrap();
    assert_eq!(lines, ["[2026]: Info: Ready", "[2026]: Info: Next"]);
    assert_eq!(supervisor::parse_log(&lines[0]), Some(("Info", "Ready")));
    assert_eq!(supervisor::parse_log("unknown secret raw request"), None);
}

#[test]
fn lua_quotes_injection_and_control_bytes() {
    assert_eq!(
        lua(&json!("\"; bad() --\n\u{0000}\\é")),
        "\"\\\"; bad() --\\010\\000\\\\é\""
    );
}
