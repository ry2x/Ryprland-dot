#!/usr/bin/env bash
#  ┏┓┏┓┳┓┏┓┏┓┳┓┏┓┓┏┏┓┏┳┓
#  ┗┓┃ ┣┫┣ ┣ ┃┃┗┓┣┫┃┃ ┃
#  ┗┛┗┛┛┗┗┛┗┛┛┗┗┛┛┗┗┛ ┻
#

grim_path=$HOME/Pictures/screenshots/grim-$(date +%Y-%m-%d_%H%M).png

# Take a cropped region using slurp (interactive)
if [[ "$1" == "--crop" ]]; then
    grim -g "$(slurp -d)" "$grim_path"
    notify-send "   Crop Screenshot Captured!" -u low -i "$grim_path"

# Take the currently active window (Hyprland) using hyprctl + jq
elif [[ "$1" == "--window" ]]; then
    # Check dependencies
    if ! command -v hyprctl >/dev/null 2>&1 || ! command -v jq >/dev/null 2>&1; then
        notify-send "   Cannot capture window: hyprctl or jq missing" -u normal
        exit 1
    fi

    # Query active window geometry from Hyprland and format for grim
    # Hyprland's JSON uses "at" and "size" arrays
    geom=$(hyprctl activewindow -j | jq -r '.at[0] as $x | .at[1] as $y | .size[0] as $w | .size[1] as $h | "\($x),\($y) \($w)x\($h)"')

    if [[ -z "$geom" || "$geom" == "null" ]]; then
        notify-send "   No active window geometry found" -u normal
        exit 1
    fi

    grim -g "$geom" "$grim_path"
    notify-send "   Window Screenshot Captured!" -u low -i "$grim_path"

else
    # Fullscreen
    grim "$grim_path"
    notify-send "   Screenshot Captured!" -u low -i "$grim_path"
fi

wl-copy <"$grim_path"
