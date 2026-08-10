#!/bin/bash
# ┏┓┳┳┏┓┏┓┏┓┳┓┳┓
# ┗┓┃┃┗┓┃┃┣ ┃┃┃┃
# ┗┛┗┛┗┛┣┛┗┛┛┗┻┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

if [[ -n "${RYPRLAND_RUNTIME_DIR:-}" ]]; then
    runtime_root="$RYPRLAND_RUNTIME_DIR"
elif [[ -n "${XDG_RUNTIME_DIR:-}" ]]; then
    runtime_root="$XDG_RUNTIME_DIR/ryprland"
else
    runtime_root="/tmp/ryprland-$UID"
fi

if [[ -f "$runtime_root/rystal-shell/caffeine-remote" ]]; then
    echo "Suspend prevented by AGS Caffeine (Remote mode)"
    exit 0
fi

systemctl suspend
