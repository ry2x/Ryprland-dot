#!/usr/bin/env bash

set -uo pipefail
#  ┓ ┏┏┓┓ ┓ ┏┓┏┓┓ ┏┓┏┓┏┳┓
#  ┃┃┃┣┫┃ ┃ ┗┓┣ ┃ ┣ ┃  ┃
#  ┗┻┛┛┗┗┛┗┛┗┛┗┛┗┛┗┛┗┛ ┻
#

# Thank you gh0stzk for the script 🤲 means a lot
# Edited by Ry2X for Ryprland-dot
# Copyright (C) 2021-2025 gh0stzk <z0mbi3.zk@protonmail.com>
# Licensed under GPL-3.0 license

# WallSelect - Dynamic wallpaper selector with intelligent caching system
# Features:
#   ✔ Multi-monitor support with scaling
#   ✔ Auto-updating menu (add/delete wallpapers without restart)
#   ✔ Background image processing (selector opens without waiting)
#   ✔ Non-blocking thumbnail cache generation
#   ✔ Collision-free cache keys for nested directories
#   ✔ Adaptive icon sizing based on screen resolution
#   ✔ Lockfile system for safe concurrent operations
#   ✔ Handle gif files separately
#   ✔ Rofi integration with theme support
#   ✔ Cached previews for previously indexed wallpapers
#
# Dependencies:
#   → Core: hyprland, rofi, jq, sha256sum
#   → Media: awww, imagemagick
#   → GNU: findutils, coreutils, bc

# Set dir varialable
wallpaper_dir="$HOME/Pictures/Wallpapers"
cache_dir="${XDG_CACHE_HOME:-$HOME/.cache}/wallpaper-selector"
rofi_theme="$HOME/.config/rofi/themes/wallpaper-select.rasi"

for command in bc find flock hyprctl jq magick nproc rofi sha256sum stat theme-switch.sh wc xargs; do
    command -v "$command" >/dev/null 2>&1 || {
        printf 'wallpaper-select: required command not found: %s\n' "$command" >&2
        exit 1
    }
done

[[ -d "$wallpaper_dir" ]] || {
    printf 'wallpaper-select: wallpaper directory not found: %s\n' "$wallpaper_dir" >&2
    exit 1
}

# Create cache dir if not exists
mkdir -p "$cache_dir"

# Get focused monitor
focused_monitor=$(hyprctl monitors -j | jq -r '.[] | select(.focused) | .name')

# Get monitor width and DPI
monitor_width=$(hyprctl monitors -j | jq -r --arg mon "$focused_monitor" '.[] | select(.name == $mon) | .width')
scale_factor=$(hyprctl monitors -j | jq -r --arg mon "$focused_monitor" '.[] | select(.name == $mon) | .scale')

# Fill three columns with 640:420 landscape cards.
icon_size=$(echo "scale=0; ((($monitor_width / $scale_factor) * 0.44 - 108) / 3)" | bc)
icon_height=$(echo "scale=0; $icon_size * 420 / 640" | bc)
wallpaper_count=$(find "$wallpaper_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" \) -printf '.' | wc -c)
rofi_override="element{height:${icon_height}px;}element-icon{size:${icon_height}px;width:${icon_size}px;height:${icon_height}px;}textbox-gallery-count{content:\"${wallpaper_count} items\";}"
rofi_command=(rofi -i -show -dmenu -theme "$rofi_theme" -theme-str "$rofi_override")

# Detect number of cores and set a sensible number of jobs
get_optimal_jobs() {
    local cores=$(nproc)
    ((cores <= 2)) && echo 2 || echo $(((cores > 4) ? 4 : cores - 1))
}

PARALLEL_JOBS=$(get_optimal_jobs)

process_image() {
    local image="$1"
    local relative_path="${image#"$wallpaper_dir"/}"
    local cache_key
    local cache_file
    local metadata_file
    local lock_file
    local current_metadata

    cache_key=$(printf '%s' "$relative_path" | sha256sum | cut -d' ' -f1)
    cache_file="${cache_dir}/${cache_key}.png"
    metadata_file="${cache_dir}/.${cache_key}.meta"
    lock_file="${cache_dir}/.lock_${cache_key}"
    current_metadata="v6:$(stat -Lc '%s:%y' "$image")" || return

    (
        flock -x 200
        if [[ ! -f "$cache_file" || ! -f "$metadata_file" || "$current_metadata" != "$(<"$metadata_file")" ]]; then
            if magick "${image}[0]" -resize 640x420^ -gravity center -extent 640x420 "png:$cache_file.tmp"; then
                mv -f "$cache_file.tmp" "$cache_file"
                printf '%s\n' "$current_metadata" >"$metadata_file"
            else
                rm -f "$cache_file.tmp"
            fi
        fi
    ) 200>"$lock_file"
}

# Export variables & functions
export -f process_image
export wallpaper_dir cache_dir

# Warm missing or stale thumbnails without delaying the selector.
find "$wallpaper_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" \) -print0 |
    xargs -0 -r -P "$PARALLEL_JOBS" -I {} bash -c 'process_image "$1"' _ {} >/dev/null 2>&1 &

# Launch rofi
wall_selection=$(find "$wallpaper_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" \) -printf '%P\n' |
    LC_ALL=C sort -V |
    while IFS= read -r relative_path; do
        cache_key=$(printf '%s' "$relative_path" | sha256sum | cut -d' ' -f1)
        cache_file="${cache_dir}/${cache_key}.png"
        metadata_file="${cache_dir}/.${cache_key}.meta"
        wallpaper_path="${wallpaper_dir}/${relative_path}"
        current_metadata="v6:$(stat -Lc '%s:%y' "$wallpaper_path")"
        icon_path="$wallpaper_path"
        if [[ -f "$cache_file" && -f "$metadata_file" && "$current_metadata" == "$(<"$metadata_file")" ]]; then
            icon_path="$cache_file"
        fi
        printf '%s\x00icon\x1f%s\n' "$relative_path" "$icon_path"
    done | "${rofi_command[@]}") || exit 0

[[ -n "$wall_selection" ]] && theme-switch.sh set "$wallpaper_dir/$wall_selection"
