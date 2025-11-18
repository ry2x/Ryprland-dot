#!/usr/bin/env bash

# Set dir varialable
wall_dir="$HOME/Pictures/wallpapers"

wall_selection=$(find "$wall_dir" -type f -print0 | shuf -z -n 1 | xargs -0 basename)

[[ -n "$wall_selection" ]] && waypaper --wallpaper "${wall_dir}/${wall_selection}"
