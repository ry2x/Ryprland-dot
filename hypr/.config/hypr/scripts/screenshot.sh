#!/usr/bin/env bash
#  ┏┓┏┓┳┓┏┓┏┓┳┓┏┓┓┏┏┓┏┳┓
#  ┗┓┃ ┣┫┣ ┣ ┃┃┗┓┣┫┃┃ ┃ 
#  ┗┛┗┛┛┗┗┛┗┛┛┗┗┛┛┗┗┛ ┻ 
#                       

grim_path=~/Pictures/screenshots/grim-$(date +%Y-%m-%d_%H%M).png

if [[ "$1" == "--crop" ]]; then
	grim -g "$(slurp -d)" "$grim_path"

	notify-send "   Crop Screenshot Captured!" -u low -i "$grim_path"
else
	grim "$grim_path"

	notify-send "   Screenshot Captured!" -u low -i "$grim_path"
fi

wl-copy < "$grim_path"
