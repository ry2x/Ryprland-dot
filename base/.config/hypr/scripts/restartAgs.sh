#!/bin/bash
# ┳┓┏┓┏┓┏┳┓┏┓┳┓┏┳┓  ┏┓┏┓┏┓
# ┣┫┣ ┗┓ ┃ ┣┫┣┫ ┃ ━━┣┫┃┓┗┓
# ┛┗┗┛┗┛ ┻ ┛┗┛┗ ┻   ┛┗┗┛┗┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

ags quit -i rystal-shell 2>/dev/null

sleep 0.1

rystal-shell >/dev/null 2>&1 &
