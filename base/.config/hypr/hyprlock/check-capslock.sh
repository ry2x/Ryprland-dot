#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -uo pipefail

caps_lock=$(hyprctl devices -j 2>/dev/null | jq -r '
    [.keyboards[] | select(.main == true) | .capsLock] | first // false
' 2>/dev/null) || exit 0

if [[ "${1:-}" == "--label" ]]; then
    state="OFF"
    [[ "$caps_lock" == "true" ]] && state="ON"
    printf '<b>󰌌  CAPS LOCK</b>  •  <span alpha="72%%">%s</span>\n' "$state"
    exit 0
fi

if [[ "${1:-}" == "--state" ]]; then
    [[ "$caps_lock" == "true" ]] && printf 'ON\n' || printf 'OFF\n'
    exit 0
fi

[[ "$caps_lock" == "true" ]] && printf 'Caps Lock active\n'
