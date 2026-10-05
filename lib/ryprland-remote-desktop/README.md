# Ryprland Remote Desktop

A small Rust supervisor for Sunshine and the Hyprland `RMT-1` output. It runs on one
thread, saves/restores local display state, observes the last streaming session ending,
and keeps remote input from waking physical monitors. The shell wrapper retains the
existing `remote-desktop.sh` commands. Runtime hooks do not start a Python interpreter.

## Build and deploy

Rust 1.89 or newer is required to build. From the repository root:

```bash
base/.local/bin/deploy-ryprland-remote-desktop
```

The helper builds with `Cargo.lock`, installs the release binary atomically into
`${XDG_DATA_HOME:-$HOME/.local/share}/ryprland-remote-desktop/ryprland-remote-desktop`, and restarts an
already running `ryprland-sunshine.service`. Use `--no-restart` to defer that restart.
Cargo build output stays in the ignored `lib/ryprland-remote-desktop/target/` directory.
Stow installs the deployment helper and the command wrapper; it does not compile Rust.

`REMOTE_DESKTOP_BIN=/absolute/path/to/ryprland-remote-desktop` selects another controller binary
for development and integration tests. The wrapper passes its canonical path as
`REMOTE_DESKTOP_HOOK` so Sunshine preparation hooks use the same command entry point.

## Verify

```bash
cargo fmt --manifest-path lib/ryprland-remote-desktop/Cargo.toml --check
cargo clippy --locked --manifest-path lib/ryprland-remote-desktop/Cargo.toml --all-targets -- -D warnings
cargo test --locked --manifest-path lib/ryprland-remote-desktop/Cargo.toml
PYTHONDONTWRITEBYTECODE=1 python3 -B lib/ryprland-remote-desktop/tests/remote_desktop_integration.py
```

Rust regression tests cover saved state, repeated entry, multiple streams, reconnection,
failed preparation, rollback, hotplug, configuration reload, idle guards, private atomic
state files, old Python snapshots, subprocess failure/timeout and debug-log redaction.
The Python integration client exercises a real nested Hyprland compositor and Sunshine
with temporary pairing state. It requires the runtime applications, Python 3 and openssl.
See [remote login](../../docs/remote-login.md) for deployment and recovery commands.

## Memory

The supervisor uses polling without worker threads or an asynchronous runtime. Pending
log lines are capped at 64 KiB; command replies are limited to 1 MiB per stream. Debug,
verbose and unrecognized lines are discarded rather than persisted. Runtime dependencies
remain `hyprctl`, Sunshine and the existing AGS/suspend hooks.

Measure the supervisor separately from its Sunshine child, in the same standby/streaming
state. The service's `MainPID` identifies the supervisor; `/proc/<pid>/smaps_rollup` gives
RSS and PSS. PSS apportions shared pages and is useful alongside RSS for this comparison.
