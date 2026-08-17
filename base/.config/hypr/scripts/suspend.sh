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
    echo "Suspend prevented by AGS Caffeine (Remote mode)"
    exit 0
fi

systemctl suspend
