#!/usr/bin/env bash
#  ┳┓┏┓┏┓┓┏┓┓ ┳┏┓┓┏┏┳┓
#  ┣┫┣┫┃ ┃┫ ┃ ┃┃┓┣┫ ┃
#  ┻┛┛┗┗┛┛┗┛┗┛┻┗┛┛┗ ┻
#

# This script is for backlight control using ddcutil.
# If you wannta use brightnessctl, delete this file and rename backlight.bk.sh to backlight.sh, then change the command in hyprland.conf accordingly.

set -u

# Constants
STEP=20
VCP_CODE=10 # It means brightness in DDC/CI

IMAGE_DIR="$HOME/.config/swaync/icons"

# Get connected display IDs
get_displays() {
    ddcutil detect | grep "Display" | awk '{print $2}'
}

# Get brightness (display ID as argument)
get_brightness() {
    ddcutil -d "$1" getvcp $VCP_CODE --terse | awk '{print $4}'
}

# Get first detected display brightness
get_current_brightness() {
    local first_display

    first_display=$(get_displays | head -n1)
    [ -z "$first_display" ] && return 1

    get_brightness "$first_display"
}

# Get icons
get_icon() {
    current=$(get_current_brightness)
    if [ "$current" -le "20" ]; then
        icon="$IMAGE_DIR/brightness-20.png"
    elif [ "$current" -le "40" ]; then
        icon="$IMAGE_DIR/brightness-40.png"
    elif [ "$current" -le "60" ]; then
        icon="$IMAGE_DIR/brightness-60.png"
    elif [ "$current" -le "80" ]; then
        icon="$IMAGE_DIR/brightness-80.png"
    else
        icon="$IMAGE_DIR/brightness-100.png"
    fi
}

# Notify
notify_user() {
    notify-send -e -h string:x-canonical-private-synchronous:brightness_notif -h int:value:$current -u low -i "$icon" "Brightness : $current%"
}

# Change brightness
change_brightness() {
    local delta="$1"
    local current
    local max
    local target
    local info

    for d in $(get_displays); do
        info=$(ddcutil -d "$d" getvcp "$VCP_CODE" --terse)
        current=$(echo "$info" | awk '{print $4}')
        max=$(echo "$info" | awk '{print $5}')

        target=$((current + delta))
        if [ "$target" -lt 0 ]; then
            target=0
        elif [ "$target" -gt "$max" ]; then
            target=$max
        fi

        ddcutil -d "$d" setvcp "$VCP_CODE" "$target"
    done

    if current=$(get_current_brightness); then
        get_icon
        notify_user
    fi
}

notify-send -e -h "Running backlight script with argument: $1"
case "$1" in
--get)
    for d in $(get_displays); do
        val=$(ddcutil -d "$d" getvcp $VCP_CODE --terse | awk '{print $4}')
        echo "Display $d: Brightness is $val%"
    done
    ;;
--inc)
    echo "Increasing brightness by $STEP%..."
    change_brightness "$STEP"
    ;;
--dec)
    echo "Decreasing brightness by $STEP%..."
    change_brightness "-$STEP"
    ;;
*)
    echo "Usage: $0 {--get|--inc|--dec}"
    exit 1
    ;;
esac
