#!/usr/bin/env bash
# ┏┳┓┏┓┏┓┏┓┓ ┏┓┓ ┏┓┓┏┏┓┳┳┏┳┓
#  ┃ ┃┃┃┓┃┓┃ ┣ ┃ ┣┫┗┫┃┃┃┃ ┃
#  ┻ ┗┛┗┛┗┛┗┛┗┛┗┛┛┗┗┛┗┛┗┛ ┻
#

iDIR="$HOME/.config/swaync/icons"

# define layouts as a Bash array
layouts=("dwindle" "master")
current_layout=$(hyprctl getoption general:layout | grep "str" | awk '{print $2}')

function get_icon() {
    if [ "$current_layout" == "${layouts[0]}" ]; then
        echo "$iDIR/master.png"
    else
        echo "$iDIR/dwindle.png"
    fi
}

function set_layout() {
    result=$(hyprctl keyword general:layout "$1")

    if [ "$result" == "ok" ]; then
        notify-send -e -h string:x-canonical-private-synchronous:layout_notif "Layout: $1" "Layout has been changed to $1" -i "$(get_icon)"
    else
        notify-send -e -h string:x-canonical-private-synchronous:layout_notif "Layout Change Error" "Failed to change layout to $1" -u critical
    fi
}

if [ "$current_layout" == "${layouts[0]}" ]; then
    set_layout "${layouts[1]}"
else
    set_layout "${layouts[0]}"
fi
