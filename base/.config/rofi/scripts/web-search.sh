#!/usr/bin/env bash

set -uo pipefail

rofi_theme="$HOME/.config/rofi/themes/web-search.rasi"

youtube_option=" 󰗃 "
browser_option="  "
music_option=" 󰎆 "

command -v rofi >/dev/null 2>&1 || {
    printf 'web-search: required command not found: rofi\n' >&2
    exit 1
}

chosen=$(printf '%s\n' "$youtube_option" "$browser_option" "$music_option" |
    rofi -markup-rows -dmenu -theme "$rofi_theme") || exit 0

case "$chosen" in
"$youtube_option")
    command -v kitty >/dev/null 2>&1 && command -v yt-x >/dev/null 2>&1 || {
        printf 'web-search: YouTube command dependencies are unavailable\n' >&2
        exit 1
    }
    kitty --title "YouTube" -e yt-x
    ;;
"$browser_option")
    command -v brave >/dev/null 2>&1 || {
        printf 'web-search: required command not found: brave\n' >&2
        exit 1
    }
    brave --enable-wayland-ime
    ;;
"$music_option")
    command -v youtube-music >/dev/null 2>&1 || {
        printf 'web-search: required command not found: youtube-music\n' >&2
        exit 1
    }
    youtube-music
    ;;
esac
