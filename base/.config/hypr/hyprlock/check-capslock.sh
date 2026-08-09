#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -uo pipefail

caps_lock=$(hyprctl devices -j 2>/dev/null | jq -r '
    [.keyboards[] | select(.main == true) | .capsLock] | first // false
' 2>/dev/null) || exit 0

[[ "$caps_lock" == "true" ]] && printf 'Caps Lock active\n'
