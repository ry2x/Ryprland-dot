#!/bin/bash
# ┏┓┳┳┏┓┏┓┏┓┳┓┳┓
# ┗┓┃┃┗┓┃┃┣ ┃┃┃┃
# ┗┛┗┛┗┛┣┛┗┛┛┗┻┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

if [[ -n "${RYSTAL_SHELL_RUNTIME_DIR:-}" ]]; then
    runtime_root="$RYSTAL_SHELL_RUNTIME_DIR"
elif [[ -n "${XDG_RUNTIME_DIR:-}" ]]; then
    runtime_root="$XDG_RUNTIME_DIR/rystal-shell"
else
    runtime_root="/tmp/rystal-shell-$UID"
fi

if [[ -f "$runtime_root/caffeine-remote" ]]; then
    notify-send -a "Ryprland" -i system-suspend "Suspend prevented" \
        "Caffeine remote mode is enabled." || true
    exit 0
fi

notify-send -a "Ryprland" -i system-suspend "Suspending" \
    "Requesting system suspend." || true
systemctl suspend
suspend_status=$?
if (( suspend_status != 0 )); then
    notify-send -a "Ryprland" -i system-suspend -u critical "Suspend failed" \
        "systemctl suspend failed (exit code: $suspend_status)." || true
fi
exit "$suspend_status"
