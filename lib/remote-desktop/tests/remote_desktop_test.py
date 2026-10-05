"""Regression tests for streaming state, restoration and supervisor failures."""

import contextlib
import copy
import importlib.util
import io
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch


SCRIPT = Path(__file__).resolve().parents[3] / "base/.local/bin/remote-desktop.py"
spec = importlib.util.spec_from_file_location("remote_desktop", SCRIPT)
remote = importlib.util.module_from_spec(spec)
spec.loader.exec_module(remote)


class DisplayStateTests(unittest.TestCase):
    def setUp(self):
        self.temporary = tempfile.TemporaryDirectory()
        self.addCleanup(self.temporary.cleanup)
        self.environment = patch.dict(os.environ, {
            "XDG_RUNTIME_DIR": self.temporary.name,
            "HYPRLAND_INSTANCE_SIGNATURE": "test",
            "XDG_CONFIG_HOME": self.temporary.name
        })
        self.environment.start()
        self.addCleanup(self.environment.stop)
        self.monitors = [
            self.monitor("DP-1", True, 0, True),
            self.monitor("HDMI-A-1", False, 1920),
            self.monitor(remote.OUTPUT, True, 10000)
        ]
        self.cursor = {"x": 777, "y": 222}
        self.options = {key: (not value if isinstance(value, bool) else 2) for key, value in remote.REMOTE_OPTIONS.items()}
        self.before = copy.deepcopy((self.monitors, self.cursor, self.options))
        self.commands = []
        patches = [
            patch.object(remote, "hypr_json", self.query),
            patch.object(remote, "configure", self.options.update),
            patch.object(remote, "dpms", self.dpms),
            patch.object(remote, "focus", self.focus),
            patch.object(remote, "run", lambda *args: self.commands.append(args))
        ]
        for mock in patches:
            mock.start()
            self.addCleanup(mock.stop)
        self.desktop = remote.Desktop()

    @staticmethod
    def monitor(name, enabled, x, focused=False):
        return {"name": name, "dpmsStatus": enabled, "x": x, "y": 10000 if name == remote.OUTPUT else 0,
                "width": 1920, "height": 1080, "scale": 1, "focused": focused}

    def query(self, command, *args):
        if command == "monitors":
            return copy.deepcopy(self.monitors)
        if command == "cursorpos":
            return self.cursor.copy()
        if command == "getoption":
            value = self.options[args[0].replace(":", ".")]
            return {"bool" if isinstance(value, bool) else "int": value}
        raise AssertionError(command)

    def dpms(self, name, enabled):
        next(m for m in self.monitors if m["name"] == name)["dpmsStatus"] = enabled

    def focus(self, name, position):
        for monitor in self.monitors:
            monitor["focused"] = monitor["name"] == name
        self.cursor = position.copy()

    def assert_remote(self):
        self.assertTrue(all(m["dpmsStatus"] == (m["name"] == remote.OUTPUT) for m in self.monitors))
        self.assertEqual(self.options, remote.REMOTE_OPTIONS)

    def assert_restored(self):
        self.assertEqual((self.monitors, self.cursor, self.options), self.before)
        self.assertIsNone(self.desktop.read())

    def test_repeated_enter_wake_and_idle_do_not_replace_snapshot(self):
        self.desktop.enter()
        self.desktop.enter()
        for action in ("wake", "idle-off", "idle-dim", "idle-brightness", "idle-suspend"):
            self.desktop.idle(action)
            self.assert_remote()
        self.assertEqual(self.commands, [])
        self.desktop.restore()
        self.assert_restored()

    def test_reconnect_and_multiple_streams_restore_only_after_last_end(self):
        streaming = remote.Streaming(self.desktop)
        for _ in range(2):
            streaming.message("Info", "New streaming session started [active sessions: 1]")
            streaming.message("Info", "New streaming session started [active sessions: 2]")
            # Transport disconnect/timeout is not counted twice; only joined sessions end.
            streaming.message("Info", "CLIENT DISCONNECTED")
            streaming.message("Info", "192.0.2.1: Ping Timeout")
            self.desktop.restore(only_idle=True)
            self.assert_remote()
            streaming.message("Debug", "Session ended")
            self.assert_remote()
            self.assertEqual(self.desktop.read()["sessions"], 1)
            streaming.message("Debug", "Session ended")
            self.assert_restored()

    def test_failed_stream_and_failed_preparation_restore(self):
        streaming = remote.Streaming(self.desktop)
        streaming.message("Info", "New streaming session started [active sessions: 1]")
        streaming.message("Error", "Failed to start a streaming session")
        self.assert_restored()
        self.desktop.enter()
        with patch.object(remote.time, "monotonic", return_value=self.desktop.read()["pending_since"] + 31):
            self.desktop.sync()
        self.assert_restored()

    def test_partial_entry_failure_restores_previous_state(self):
        def fail_enforce(state):
            self.options.update(remote.REMOTE_OPTIONS)
            self.dpms("DP-1", False)
            raise RuntimeError("display disappeared")

        with patch.object(self.desktop, "enforce", fail_enforce):
            with self.assertRaises(RuntimeError):
                self.desktop.enter()
        self.assert_restored()

    def test_reload_hotplug_and_disconnected_original_display(self):
        self.desktop.enter()
        self.monitors.append(self.monitor("DP-2", True, 4000))
        self.options.update(self.before[2])
        self.dpms("DP-1", True)
        self.desktop.sync()
        self.assert_remote()
        self.monitors = [m for m in self.monitors if m["name"] != "DP-1"]
        self.desktop.restore()
        self.assertTrue(next(m for m in self.monitors if m["name"] == "DP-2")["dpmsStatus"])
        self.assertEqual(self.options, self.before[2])
        self.assertNotEqual(next(m for m in self.monitors if m["focused"])["name"], remote.OUTPUT)

    def test_standby_idle_keeps_capture_available(self):
        self.desktop.idle("idle-off")
        self.assertTrue(next(m for m in self.monitors if m["name"] == remote.OUTPUT)["dpmsStatus"])
        self.assertFalse(any(m["dpmsStatus"] for m in self.monitors if m["name"] != remote.OUTPUT))
        self.desktop.idle("wake")
        self.assertTrue(all(m["dpmsStatus"] for m in self.monitors))

    def test_existing_preparation_commands_are_retained_without_rewriting_config(self):
        config = Path(self.temporary.name) / "sunshine/sunshine.conf"
        config.parent.mkdir()
        existing = [{"do": "echo existing", "undo": "echo undo"}]
        original = "global_prep_cmd = " + json.dumps(existing, indent=4) + "\n"
        config.write_text(original)
        commands = remote.preparation_commands()
        self.assertEqual(commands[1:], existing)
        self.assertIn("--enter", commands[0]["do"])
        self.assertEqual(config.read_text(), original)


class SupervisorTests(unittest.TestCase):
    def test_real_subprocess_logs_failure_and_debug_redaction(self):
        class Desktop:
            def __init__(self):
                self.events = []

            def enter(self):
                self.events.append("enter")

            def sessions(self, count):
                self.events.append(count)

            def restore(self):
                self.events.append("restore")

            def sync(self):
                pass

        logs = [
            "[2026-10-06 01:00:00]: Debug: rikey -- PRIVATE_TEST_KEY",
            "[2026-10-06 01:00:00]: Info: New streaming session started [active sessions: 1]",
            "[2026-10-06 01:00:00]: Info: CLIENT DISCONNECTED",
            "[2026-10-06 01:00:00]: Debug: Session ended",
            "[2026-10-06 01:00:00]: Info: New streaming session started [active sessions: 1]",
            "[2026-10-06 01:00:00]: Fatal: Unexpected exit"
        ]
        original = subprocess.Popen
        code = "import sys,time; print(" + repr("\n".join(logs)) + ",flush=True); time.sleep(.1); sys.exit(7)"
        desktop = Desktop()
        output = io.StringIO()
        with patch.object(remote, "preparation_commands", return_value=[]), \
                patch.object(remote.subprocess, "Popen", side_effect=lambda *a, **k: original([sys.executable, "-c", code], **k)), \
                contextlib.redirect_stdout(output):
            self.assertEqual(remote.serve(desktop), 7)
        self.assertEqual(desktop.events, ["enter", 1, 0, "restore", "enter", 1, "restore"])
        self.assertNotIn("PRIVATE_TEST_KEY", output.getvalue())
        self.assertNotIn("Debug:", output.getvalue())
        self.assertIn("Unexpected exit", output.getvalue())


if __name__ == "__main__":
    unittest.main()
