#!/usr/bin/env bash

wallpaper_path=$(grep "wallpaper =" $HOME/.config/waypaper/config.ini | cut -d '=' -f2- | sed -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

wallpaper_path="${wallpaper_path/#~/$HOME}"

[[ -n "$wallpaper_path" ]] && waypaper --wallpaper "$wallpaper_path"
