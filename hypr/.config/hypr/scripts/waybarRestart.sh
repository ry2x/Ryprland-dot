#!/usr/bin/env bash
#  ┓ ┏┏┓┓┏┳┓┏┓┳┓  ┏┓┏┓┓ ┏┓┏┓┏┳┓
#  ┃┃┃┣┫┗┫┣┫┣┫┣┫━━┗┓┣ ┃ ┣ ┃  ┃
#  ┗┻┛┛┗┗┛┻┛┛┗┛┗  ┗┛┗┛┗┛┗┛┗┛ ┻
#

killall waybar 2>/dev/null

hyprctl dispatch exec waybar &

killall swaync 2>/dev/null

hyprctl dispatch exec swaync &
