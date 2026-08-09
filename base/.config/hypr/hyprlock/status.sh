#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -uo pipefail
shopt -s nullglob

for battery in /sys/class/power_supply/BAT*; do
    [[ -r "$battery/capacity" ]] || continue

    IFS= read -r capacity <"$battery/capacity" || continue
    status=""
    [[ -r "$battery/status" ]] && IFS= read -r status <"$battery/status"

    case "$status" in
    Charging) printf '(+) %s%%\n' "$capacity" ;;
    Full) printf '%s%%\n' "$capacity" ;;
    *) printf '%s%% remaining\n' "$capacity" ;;
    esac
    exit 0
done

printf '\n'
