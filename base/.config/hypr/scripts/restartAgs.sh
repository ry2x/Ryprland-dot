#!/bin/bash
# ┳┓┏┓┏┓┏┳┓┏┓┳┓┏┳┓  ┏┓┏┓┏┓
# ┣┫┣ ┗┓ ┃ ┣┫┣┫ ┃ ━━┣┫┃┓┗┓
# ┛┗┗┛┗┛ ┻ ┛┗┛┗ ┻   ┛┗┗┛┗┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

ags quit 2>/dev/null

killall -q gjs start-ags

sleep 0.1

~/.config/ags/launch.sh >/dev/null 2>&1 &
