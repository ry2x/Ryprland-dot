#!/usr/bin/env python3
"""Sunshine lifecycle supervision and reversible Hyprland display isolation."""

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

import argparse
import contextlib
import fcntl
import json
import os
from pathlib import Path
import re
import selectors
import shlex
import signal
import subprocess
import sys
import tempfile
import time


OUTPUT = "RMT-1"
REMOTE_OPTIONS = {
    "misc.mouse_move_enables_dpms": False,
    "misc.key_press_enables_dpms": False,
    "cursor.no_warps": True,
    "cursor.warp_on_change_workspace": 0,
    "cursor.warp_on_toggle_special": 0,
    "binds.window_direction_monitor_fallback": False
}


def run(*args):
    result = subprocess.run(args, text=True, capture_output=True, timeout=10)
    if result.returncode:
        raise RuntimeError(f"{args[0]}: {result.stderr.strip() or result.stdout.strip()}")
    return result.stdout


def hypr_json(*args):
    return json.loads(run("hyprctl", "-j", *args))


def lua(value):
    if isinstance(value, dict):
        return "{" + ", ".join(f"[{lua(k)}] = {lua(v)}" for k, v in value.items()) + "}"
    if isinstance(value, bool):
        return "true" if value else "false"
    return json.dumps(value)


def evaluate(code):
    # hyprctl may report a Lua error while still exiting successfully.
    result = run("hyprctl", "eval", code).strip()
    if result != "ok":
        raise RuntimeError(f"Hyprland Lua: {result}")


def configure(options):
    categories = {}
    for key, value in options.items():
        category, option = key.split(".", 1)
        categories.setdefault(category, {})[option] = value
    evaluate(f"hl.config({lua(categories)})")


def dpms(name, enabled):
    evaluate(f"hl.dispatch(hl.dsp.dpms({lua({'monitor': name, 'action': 'enable' if enabled else 'disable'})}))")


def focus(name, position):
    evaluate(f"hl.dispatch(hl.dsp.focus({lua({'monitor': name})})); "
             f"hl.dispatch(hl.dsp.cursor.move({lua(position)}))")


class Desktop:
    def __init__(self):
        instance = os.environ["HYPRLAND_INSTANCE_SIGNATURE"]
        self.directory = Path(os.environ["XDG_RUNTIME_DIR"]) / f"ryprland-remote-desktop-{instance}"
        self.directory.mkdir(mode=0o700, exist_ok=True)
        self.path = self.directory / "state.json"

    @contextlib.contextmanager
    def locked(self):
        with (self.directory / "lock").open("a") as lock:
            deadline = time.monotonic() + 10
            while True:
                try:
                    fcntl.flock(lock, fcntl.LOCK_EX | fcntl.LOCK_NB)
                    break
                except BlockingIOError:
                    if time.monotonic() > deadline:
                        raise RuntimeError("Timed out waiting for remote desktop state")
                    time.sleep(0.05)
            yield

    def read(self):
        if not self.path.exists():
            return None
        return json.loads(self.path.read_text())

    def write(self, state):
        with tempfile.NamedTemporaryFile(mode="w", dir=self.directory, delete=False) as temporary:
            json.dump(state, temporary)
        os.replace(temporary.name, self.path)

    def prepare(self):
        with self.locked():
            monitors = hypr_json("monitors")
            local = next((m for m in monitors if m.get("focused")), None)
            cursor = hypr_json("cursorpos")
            if not any(m["name"] == OUTPUT for m in monitors):
                run("hyprctl", "output", "create", "headless", OUTPUT)
            evaluate(f"hl.monitor({lua({'output': OUTPUT, 'mode': '1920x1080@60', 'scale': 1, 'position': '10000x10000'})})")
            for _ in range(50):
                if any(m["name"] == OUTPUT and m["width"] > 0 for m in hypr_json("monitors")):
                    if local:
                        focus(local["name"], cursor)
                    return
                time.sleep(0.1)
            raise RuntimeError("Remote output did not become ready")

    def enforce(self, state):
        configure(REMOTE_OPTIONS)
        for monitor in hypr_json("monitors"):
            name = monitor["name"]
            if name != OUTPUT and name not in state["monitors"]:
                state["monitors"][name] = monitor["dpmsStatus"]
                # Save hotplugged displays before switching them off.
                self.write(state)
            enabled = name == OUTPUT
            if monitor["dpmsStatus"] != enabled:
                dpms(name, enabled)

    def enter(self):
        with self.locked():
            state = self.read()
            monitors = hypr_json("monitors")
            remote = next((m for m in monitors if m["name"] == OUTPUT), None)
            if remote is None:
                raise RuntimeError("Remote output is missing; run --prepare first")
            if state is None:
                options = {}
                for key in REMOTE_OPTIONS:
                    option = hypr_json("getoption", key.replace(".", ":", 1))
                    options[key] = option["bool"] if "bool" in option else option["int"]
                state = {
                    "options": options,
                    "monitors": {m["name"]: m["dpmsStatus"] for m in monitors if m["name"] != OUTPUT},
                    "focus": next((m["name"] for m in monitors if m.get("focused")), None),
                    "cursor": hypr_json("cursorpos"),
                    "sessions": 0,
                    "pending_since": time.monotonic()
                }
                self.write(state)
                try:
                    self.enforce(state)
                    position = {
                        "x": remote["x"] + remote["width"] / remote["scale"] / 2,
                        "y": remote["y"] + remote["height"] / remote["scale"] / 2
                    }
                    focus(OUTPUT, position)
                except Exception:
                    self.restore_locked()
                    raise
            else:
                self.enforce(state)

    def sessions(self, count):
        with self.locked():
            state = self.read()
            if state:
                state["sessions"] = count
                self.write(state)

    def restore_locked(self):
        state = self.read()
        if state is None:
            return
        monitors = {m["name"]: m for m in hypr_json("monitors")}
        # Restore the cursor before enabling automatic wake-up again.
        if state["focus"] in monitors:
            focus(state["focus"], state["cursor"])
        else:
            local = next((m for name, m in monitors.items() if name != OUTPUT), None)
            if local:
                focus(local["name"], {"x": local["x"] + 100, "y": local["y"] + 100})
        for name, enabled in state["monitors"].items():
            if name in monitors:
                dpms(name, enabled)
        configure(state["options"])
        self.path.unlink()

    def restore(self, only_idle=False):
        with self.locked():
            state = self.read()
            if not only_idle or not state or state["sessions"] == 0:
                self.restore_locked()

    def sync(self):
        with self.locked():
            state = self.read()
            if state:
                if state["sessions"] == 0 and time.monotonic() - state["pending_since"] > 30:
                    self.restore_locked()
                else:
                    self.enforce(state)

    def idle(self, action):
        with self.locked():
            state = self.read()
            if state:
                self.enforce(state)
                return
            if action in ("wake", "idle-off"):
                for monitor in hypr_json("monitors"):
                    # Standby capture must remain available, even with local DPMS off.
                    dpms(monitor["name"], action == "wake" or monitor["name"] == OUTPUT)
            elif action == "idle-dim":
                run("ags", "request", "-i", "rystal-shell", "brightness", "set", "0")
            elif action == "idle-brightness":
                run("ags", "request", "-i", "rystal-shell", "brightness", "r")
            elif action == "idle-suspend":
                run(str(Path.home() / ".config/hypr/scripts/suspend.sh"))

    def remove_output(self):
        with self.locked():
            monitors = hypr_json("monitors")
            if any(m["name"] == OUTPUT for m in monitors) and any(m["name"] != OUTPUT for m in monitors):
                run("hyprctl", "output", "remove", OUTPUT)


def preparation_commands():
    # Add our hook without changing the user's Sunshine config or existing hooks.
    config_home = Path(os.environ.get("XDG_CONFIG_HOME", Path.home() / ".config"))
    config = config_home / "sunshine/sunshine.conf"
    existing = []
    if config.exists():
        match = re.search(r"(?m)^\s*global_prep_cmd\s*=\s*", config.read_text())
        if match:
            existing, _ = json.JSONDecoder().raw_decode(config.read_text()[match.end():])
            if not isinstance(existing, list):
                raise RuntimeError("Sunshine global_prep_cmd must be a JSON list")
    script = shlex.quote(str(Path(__file__).resolve().with_suffix(".sh")))
    return [{"do": f"{script} --enter", "undo": f"{script} --release", "elevated": False}] + existing


class Streaming:
    def __init__(self, desktop):
        self.desktop = desktop
        self.count = 0

    def message(self, level, message):
        if level == "Info" and re.fullmatch(r"New streaming session started \[active sessions: \d+\]", message):
            if self.count == 0:
                self.desktop.enter()
            self.count += 1
            self.desktop.sessions(self.count)
        elif (level == "Debug" and message == "Session ended") or (level == "Error" and message == "Failed to start a streaming session"):
            self.count = max(0, self.count - 1)
            self.desktop.sessions(self.count)
            if self.count == 0:
                self.desktop.restore()


def serve(desktop):
    command = [
        "/usr/bin/sunshine", f"output_name={OUTPUT}", "capture=wlr",
        "min_log_level=debug", "log_path=/dev/null",
        "global_prep_cmd=" + json.dumps(preparation_commands())
    ]
    streaming = Streaming(desktop)
    child = subprocess.Popen(command, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
    previous = {}
    for number in (signal.SIGTERM, signal.SIGINT):
        previous[number] = signal.signal(number, lambda *_: child.terminate() if child.poll() is None else None)
    try:
        with selectors.DefaultSelector() as selector:
            selector.register(child.stdout, selectors.EVENT_READ)
            buffer = b""
            next_sync = time.monotonic() + 1
            exited_since = None
            while True:
                for key, _ in selector.select(timeout=0.2):
                    data = os.read(key.fd, 65536)
                    if not data:
                        selector.unregister(key.fileobj)
                        continue
                    buffer += data
                    while b"\n" in buffer:
                        line, buffer = buffer.split(b"\n", 1)
                        text = re.sub(r"\x1b\[[0-9;]*m", "", line.decode(errors="replace"))
                        match = re.match(r"^\[[^\]]+\]: (Verbose|Debug|Info|Warning|Error|Fatal): (.*)$", text)
                        if match:
                            level, message = match.groups()
                            streaming.message(level, message)
                            # Debug requests contain pairing/input keys. Never persist them.
                            if level not in ("Verbose", "Debug"):
                                print(text, flush=True)
                if time.monotonic() >= next_sync:
                    desktop.sync()
                    next_sync = time.monotonic() + 1
                if child.poll() is not None:
                    # Drain final diagnostics/session events after process exit.
                    if exited_since is None:
                        exited_since = time.monotonic()
                    if not selector.get_map() or time.monotonic() - exited_since > 1:
                        print(f"Remote desktop: Sunshine exited with status {child.returncode}", flush=True)
                        return child.returncode
    finally:
        for number, handler in previous.items():
            signal.signal(number, handler)
        if child.poll() is None:
            child.terminate()
            try:
                child.wait(timeout=10)
            except subprocess.TimeoutExpired:
                child.kill()
                child.wait()
        child.stdout.close()
        desktop.restore()


def main():
    actions = ["prepare", "serve", "enter", "release", "restore", "sync", "status",
               "wake", "idle-off", "idle-dim", "idle-brightness", "idle-suspend", "remove-output"]
    parser = argparse.ArgumentParser(description=__doc__)
    group = parser.add_mutually_exclusive_group(required=True)
    for action in actions:
        group.add_argument("--" + action, action="store_true")
    args = parser.parse_args()
    action = next(a for a in actions if getattr(args, a.replace("-", "_")))
    desktop = Desktop()
    if action == "serve":
        return serve(desktop)
    if action == "release":
        desktop.restore(only_idle=True)
    elif action == "status":
        with desktop.locked():
            state = desktop.read()
            print(json.dumps({"mode": "streaming" if state else "standby", "sessions": state["sessions"] if state else 0}))
    elif action in ("wake", "idle-off", "idle-dim", "idle-brightness", "idle-suspend"):
        desktop.idle(action)
    else:
        getattr(desktop, action.replace("-", "_"))()
    return 0


if __name__ == "__main__":
    try:
        sys.exit(main())
    except (RuntimeError, OSError, ValueError, KeyError, subprocess.TimeoutExpired) as error:
        print(f"Remote desktop: {error}", file=sys.stderr)
        sys.exit(1)
