#!/usr/bin/env bash
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
wall_dir="$HOME/Pictures/Wallpapers"
cacheDir="$HOME/.cache/wallcache"

# Create cache dir if not exists
[ -d "$cacheDir" ] || mkdir -p "$cacheDir"

# Get focused monitor
focused_monitor=$(hyprctl monitors -j | jq -r '.[] | select(.focused) | .name')

# Get monitor width and DPI
monitor_width=$(hyprctl monitors -j | jq -r --arg mon "$focused_monitor" '.[] | select(.name == $mon) | .width')
scale_factor=$(hyprctl monitors -j | jq -r --arg mon "$focused_monitor" '.[] | select(.name == $mon) | .scale')

# Calculate icon size
icon_size=$(echo "scale=2; ($monitor_width * 14) / ($scale_factor * 96)" | bc)
rofi_override="element-icon{size:${icon_size}px;}"
rofi_command="rofi -i -show -dmenu -theme $HOME/.config/rofi/applets/wallSelect.rasi -theme-str $rofi_override"

# Detect number of cores and set a sensible number of jobs
get_optimal_jobs() {
    local cores=$(nproc)
    ((cores <= 2)) && echo 2 || echo $(((cores > 4) ? 4 : cores - 1))
}

PARALLEL_JOBS=$(get_optimal_jobs)

process_image() {
    local image="$1"
    local relative_path="${image#"$wall_dir"/}"
    local cache_key
    local cache_file
    local metadata_file
    local lock_file
    local current_metadata

    cache_key=$(printf '%s' "$relative_path" | sha256sum | cut -d' ' -f1)
    cache_file="${cacheDir}/${cache_key}.png"
    metadata_file="${cacheDir}/.${cache_key}.meta"
    lock_file="${cacheDir}/.lock_${cache_key}"
    current_metadata=$(stat -Lc '%s:%y' "$image") || return

    (
        flock -x 200
        if [[ ! -f "$cache_file" || ! -f "$metadata_file" || "$current_metadata" != "$(<"$metadata_file")" ]]; then
            if magick "${image}[0]" -resize 500x500^ -gravity center -extent 500x500 "png:$cache_file.tmp"; then
                mv -f "$cache_file.tmp" "$cache_file"
                printf '%s\n' "$current_metadata" >"$metadata_file"
            else
                rm -f "$cache_file.tmp"
            fi
        fi
        rm -f "$lock_file"
    ) 200>"$lock_file"
}

# Export variables & functions
export -f process_image
export wall_dir cacheDir

# Warm missing or stale thumbnails without delaying the selector.
find "$wall_dir" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" \) -print0 |
    xargs -0 -r -P "$PARALLEL_JOBS" -I {} bash -c 'process_image "$1"' _ {} >/dev/null 2>&1 &

# Check if rofi is already running
if pidof rofi >/dev/null; then
    pkill rofi
fi

# Launch rofi
wall_selection=$(find "${wall_dir}" -type f \( -iname "*.jpg" -o -iname "*.jpeg" -o -iname "*.png" -o -iname "*.webp" -o -iname "*.gif" \) -printf '%P\n' |
    LC_ALL=C sort -V |
    while IFS= read -r relative_path; do
        cache_key=$(printf '%s' "$relative_path" | sha256sum | cut -d' ' -f1)
        cache_file="${cacheDir}/${cache_key}.png"
        icon_path="$cache_file"
        [[ -f "$icon_path" ]] || icon_path="${wall_dir}/${relative_path}"
        printf '%s\x00icon\x1f%s\n' "$relative_path" "$icon_path"
    done | $rofi_command)

[[ -n "$wall_selection" ]] && theme-switch.sh set "${wall_dir}/${wall_selection}"
