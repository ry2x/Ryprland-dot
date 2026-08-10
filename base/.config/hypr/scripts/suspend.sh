#!/bin/bash
# ┏┓┳┳┏┓┏┓┏┓┳┓┳┓
# ┗┓┃┃┗┓┃┃┣ ┃┃┃┃
# ┗┛┗┛┗┛┣┛┗┛┛┗┻┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

if [ -f /tmp/ags_caffeine_remote ]; then
    echo "Suspend prevented by AGS Caffeine (Remote mode)"
    exit 0
fi

systemctl suspend
