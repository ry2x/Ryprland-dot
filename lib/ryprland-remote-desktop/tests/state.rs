// SPDX-FileCopyrightText: 2026 Ry2X
// SPDX-License-Identifier: GPL-3.0-or-later

use anyhow::{Result, bail};
use ryprland_remote_desktop::desktop::{
    Backend, Desktop, Monitor, OUTPUT, Position, remote_options,
};
use ryprland_remote_desktop::supervisor::Streaming;
use serde_json::{Value, json};
use std::cell::RefCell;
use std::collections::BTreeMap;
use std::fs;
use std::os::unix::fs::PermissionsExt;
use tempfile::TempDir;

#[derive(Clone, Debug, PartialEq)]
struct Displays {
    monitors: Vec<Monitor>,
    cursor: Position,
    options: BTreeMap<String, Value>,
    commands: Vec<String>,
    fail_dpms_once: bool,
}

struct FakeHyprland(RefCell<Displays>);

fn monitor(name: &str, dpms: bool, x: f64, focused: bool) -> Monitor {
    Monitor {
        name: name.to_owned(),
        dpms,
        x,
        y: if name == OUTPUT { 10000.0 } else { 0.0 },
        width: 1920.0,
        height: 1080.0,
        scale: 1.0,
        focused,
    }
}

// Interpret only the small table/dispatcher subset emitted by this controller.
// Actual Lua semantics are verified separately in the nested compositor test.
fn table(code: &str, prefix: &str, suffix: &str) -> Value {
    let body = code
        .strip_prefix(prefix)
        .unwrap()
        .strip_suffix(suffix)
        .unwrap();
    serde_json::from_str(&body.replace("[\"", "\"").replace("\"] = ", "\": ")).unwrap()
}

impl Backend for FakeHyprland {
    fn query(&self, args: &[&str]) -> Result<Value> {
        let state = self.0.borrow();
        Ok(match args {
            ["monitors"] => json!(state.monitors),
            ["cursorpos"] => json!(state.cursor),
            ["getoption", key] => {
                let value = &state.options[&key.replacen(':', ".", 1)];
                if value.is_boolean() {
                    json!({"bool": value})
                } else {
                    json!({"int": value})
                }
            }
            _ => panic!("Unexpected query: {args:?}"),
        })
    }

    fn evaluate(&self, code: &str) -> Result<()> {
        let mut state = self.0.borrow_mut();
        if code.starts_with("hl.config(") {
            let config = table(code, "hl.config(", ")");
            for (category, options) in config.as_object().unwrap() {
                for (key, value) in options.as_object().unwrap() {
                    state
                        .options
                        .insert(format!("{category}.{key}"), value.clone());
                }
            }
        } else if code.starts_with("hl.dispatch(hl.dsp.dpms(") {
            let value = table(code, "hl.dispatch(hl.dsp.dpms(", "))");
            let monitor = state
                .monitors
                .iter_mut()
                .find(|m| m.name == value["monitor"].as_str().unwrap())
                .unwrap();
            monitor.dpms = value["action"] == "enable";
            if state.fail_dpms_once {
                state.fail_dpms_once = false;
                bail!("Display disappeared during entry");
            }
        } else if code.starts_with("hl.dispatch(hl.dsp.focus(") {
            let (focus, cursor) = code.split_once("; ").unwrap();
            let value = table(focus, "hl.dispatch(hl.dsp.focus(", "))");
            for monitor in &mut state.monitors {
                monitor.focused = monitor.name == value["monitor"].as_str().unwrap();
            }
            state.cursor =
                serde_json::from_value(table(cursor, "hl.dispatch(hl.dsp.cursor.move(", "))"))
                    .unwrap();
        } else if code.starts_with("hl.monitor(") {
            let value = table(code, "hl.monitor(", ")");
            assert_eq!(value["position"], "10000x10000");
        } else {
            panic!("Unexpected eval: {code}");
        }
        Ok(())
    }

    fn run(&self, program: &str, args: &[&str]) -> Result<()> {
        let mut state = self.0.borrow_mut();
        state.commands.push(format!("{program} {}", args.join(" ")));
        if args == ["output", "create", "headless", OUTPUT] {
            state.monitors.push(monitor(OUTPUT, true, 10000.0, false));
        } else if args == ["output", "remove", OUTPUT] {
            state.monitors.retain(|monitor| monitor.name != OUTPUT);
        }
        Ok(())
    }
}

struct Fixture {
    desktop: Desktop<FakeHyprland>,
    before: Displays,
    _temporary: TempDir,
}

impl Fixture {
    fn new() -> Self {
        let temporary = TempDir::new().unwrap();
        let before = Displays {
            monitors: vec![
                monitor("DP-1", true, 0.0, true),
                monitor("HDMI-A-1", false, 1920.0, false),
                monitor(OUTPUT, true, 10000.0, false),
            ],
            cursor: Position { x: 777.0, y: 222.0 },
            options: remote_options()
                .into_iter()
                .map(|(key, value)| {
                    (
                        key,
                        if let Some(boolean) = value.as_bool() {
                            json!(!boolean)
                        } else {
                            json!(2)
                        },
                    )
                })
                .collect(),
            commands: Vec::new(),
            fail_dpms_once: false,
        };
        let desktop = Desktop::new(
            FakeHyprland(RefCell::new(before.clone())),
            temporary.path().join("state"),
        )
        .unwrap();
        Self {
            desktop,
            before,
            _temporary: temporary,
        }
    }

    fn assert_remote(&self) {
        let state = self.desktop.backend.0.borrow();
        assert!(state.monitors.iter().all(|m| m.dpms == (m.name == OUTPUT)));
        assert_eq!(state.options, remote_options());
    }

    fn assert_restored(&self) {
        assert_eq!(*self.desktop.backend.0.borrow(), self.before);
        assert!(self.desktop.read().unwrap().is_none());
    }
}

#[test]
fn repeated_entry_and_idle_preserve_snapshot() {
    let f = Fixture::new();
    f.desktop.enter().unwrap();
    f.desktop.enter().unwrap();
    for action in [
        "wake",
        "idle-off",
        "idle-dim",
        "idle-brightness",
        "idle-suspend",
    ] {
        f.desktop.idle(action).unwrap();
        f.assert_remote();
    }
    assert!(f.desktop.backend.0.borrow().commands.is_empty());
    f.desktop.restore(false).unwrap();
    f.assert_restored();
}

#[test]
fn multiple_streams_restore_only_after_last_end_and_reconnect() {
    let f = Fixture::new();
    let mut streaming = Streaming::default();
    for _ in 0..2 {
        streaming
            .message(
                &f.desktop,
                "Info",
                "New streaming session started [active sessions: 1]",
            )
            .unwrap();
        streaming
            .message(
                &f.desktop,
                "Info",
                "New streaming session started [active sessions: 2]",
            )
            .unwrap();
        streaming
            .message(&f.desktop, "Info", "CLIENT DISCONNECTED")
            .unwrap();
        streaming
            .message(&f.desktop, "Info", "192.0.2.1: Ping Timeout")
            .unwrap();
        f.desktop.restore(true).unwrap();
        f.assert_remote();
        streaming
            .message(&f.desktop, "Debug", "Session ended")
            .unwrap();
        f.assert_remote();
        assert_eq!(f.desktop.read().unwrap().unwrap().sessions, 1);
        streaming
            .message(&f.desktop, "Debug", "Session ended")
            .unwrap();
        f.assert_restored();
    }
}

#[test]
fn failed_stream_and_expired_preparation_restore() {
    let f = Fixture::new();
    let mut streaming = Streaming::default();
    streaming
        .message(
            &f.desktop,
            "Info",
            "New streaming session started [active sessions: 1]",
        )
        .unwrap();
    streaming
        .message(&f.desktop, "Error", "Failed to start a streaming session")
        .unwrap();
    f.assert_restored();
    f.desktop.enter().unwrap();
    let mut state = f.desktop.read().unwrap().unwrap();
    state.pending_since -= 31.0;
    f.desktop.write(&state).unwrap();
    f.desktop.sync().unwrap();
    f.assert_restored();
}

#[test]
fn partial_entry_failure_rolls_back() {
    let f = Fixture::new();
    f.desktop.backend.0.borrow_mut().fail_dpms_once = true;
    assert!(f.desktop.enter().is_err());
    f.assert_restored();
}

#[test]
fn reload_hotplug_and_removed_original_monitor() {
    let f = Fixture::new();
    f.desktop.enter().unwrap();
    {
        let mut state = f.desktop.backend.0.borrow_mut();
        state.monitors.push(monitor("DP-2", true, 4000.0, false));
        state.options = f.before.options.clone();
        state.monitors[0].dpms = true;
    }
    f.desktop.sync().unwrap();
    f.assert_remote();
    f.desktop
        .backend
        .0
        .borrow_mut()
        .monitors
        .retain(|m| m.name != "DP-1");
    f.desktop.restore(false).unwrap();
    let state = f.desktop.backend.0.borrow();
    assert!(
        state
            .monitors
            .iter()
            .find(|m| m.name == "DP-2")
            .unwrap()
            .dpms
    );
    assert_eq!(state.options, f.before.options);
    assert_ne!(
        state.monitors.iter().find(|m| m.focused).unwrap().name,
        OUTPUT
    );
}

#[test]
fn standby_idle_keeps_capture_and_delegates_suspend_to_caffeine_hook() {
    let f = Fixture::new();
    f.desktop.idle("idle-off").unwrap();
    assert!(
        f.desktop
            .backend
            .0
            .borrow()
            .monitors
            .iter()
            .all(|m| m.dpms == (m.name == OUTPUT))
    );
    f.desktop.idle("wake").unwrap();
    assert!(f.desktop.backend.0.borrow().monitors.iter().all(|m| m.dpms));
    f.desktop.idle("idle-suspend").unwrap();
    assert!(
        f.desktop
            .backend
            .0
            .borrow()
            .commands
            .last()
            .unwrap()
            .ends_with("/.config/hypr/scripts/suspend.sh ")
    );
}

#[test]
fn preparation_and_output_cleanup_preserve_local_cursor() {
    let f = Fixture::new();
    f.desktop
        .backend
        .0
        .borrow_mut()
        .monitors
        .retain(|m| m.name != OUTPUT);
    f.desktop.prepare().unwrap();
    assert_eq!(f.desktop.backend.0.borrow().cursor, f.before.cursor);
    f.desktop.remove_output().unwrap();
    assert!(
        !f.desktop
            .backend
            .0
            .borrow()
            .monitors
            .iter()
            .any(|m| m.name == OUTPUT)
    );
    f.desktop.backend.0.borrow_mut().monitors = vec![monitor(OUTPUT, true, 10000.0, true)];
    f.desktop.remove_output().unwrap();
    assert_eq!(f.desktop.backend.0.borrow().monitors.len(), 1);
}

#[test]
fn snapshot_is_private_atomic_and_reads_previous_python_state() {
    let f = Fixture::new();
    f.desktop.enter().unwrap();
    let path = f.desktop.directory.join("state.json");
    assert_eq!(
        fs::metadata(&f.desktop.directory)
            .unwrap()
            .permissions()
            .mode()
            & 0o777,
        0o700
    );
    assert_eq!(
        fs::metadata(&path).unwrap().permissions().mode() & 0o777,
        0o600
    );
    let mut value: Value = serde_json::from_slice(&fs::read(&path).unwrap()).unwrap();
    value["cursor"] = json!({"x":777,"y":222}); // Python writes integer cursor coordinates.
    fs::write(&path, serde_json::to_vec(&value).unwrap()).unwrap();
    f.desktop.restore(false).unwrap();
    f.assert_restored();
    assert_eq!(fs::read_dir(&f.desktop.directory).unwrap().count(), 1); // Only flock remains.
}

#[test]
fn corrupt_state_fails_without_changing_displays() {
    let f = Fixture::new();
    fs::write(f.desktop.directory.join("state.json"), "{invalid").unwrap();
    assert!(f.desktop.restore(false).is_err());
    assert_eq!(*f.desktop.backend.0.borrow(), f.before);
}
