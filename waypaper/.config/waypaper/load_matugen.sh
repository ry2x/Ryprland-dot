#!/usr/bin/env bash

# Set dir varialable
wall_dir="$HOME/Pictures/wallpapers"
scriptsDir="$HOME/.config/hypr/scripts"

wallpaper_path=$(grep "wallpaper =" ~/.config/waypaper/config.ini | cut -d '=' -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')
wallpaper_path="${wallpaper_path/#~/$HOME}"

# SWWW Config
FPS=60
TYPE="any"
DURATION=2
BEZIER=".43,1.19,1,.4"
SWWW_PARAMS="--transition-fps $FPS --transition-type $TYPE --transition-duration $DURATION --transition-bezier $BEZIER"

# initiate swww if not running
swww query || swww-daemon --format xrgbz

# Set wallpaper
[[ -n "$wallpaper_path" ]] && swww img "${wallpaper_path}" $SWWW_PARAMS

# Run matugen script
[[ -n "$wallpaper_path" ]] && "$scriptsDir/matugenMagick.sh" --dark

# Reload waybar swaync
#[[ -n "$wallpaper_path" ]] && "$scriptsDir/waybarRestart.sh"
