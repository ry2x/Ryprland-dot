#!/usr/bin/env bash

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -uo pipefail

theme="$HOME/.config/rofi/themes/web-search.rasi"
youtube=' 󰗃 '
browser='  '
music=' 󰎆 '

require() {
    command -v "$1" >/dev/null 2>&1 || {
        printf 'web-search: required command not found: %s\n' "$1" >&2
        exit 1
    }
}

require rofi
selection=$(printf '%s\n' "$youtube" "$browser" "$music" |
    rofi -markup-rows -dmenu -theme "$theme") || exit 0

case "$selection" in
"$youtube")
    require kitty
    require yt-x
    exec kitty --title YouTube -e yt-x
    ;;
"$browser")
    require brave
    exec brave --enable-wayland-ime
    ;;
"$music")
    require youtube-music
    exec youtube-music
    ;;
esac
