#!/usr/bin/env bash
#  ┳┓┏┓┏┓┓┏┓┓ ┳┏┓┓┏┏┳┓
#  ┣┫┣┫┃ ┃┫ ┃ ┃┃┓┣┫ ┃
#  ┻┛┛┗┗┛┛┗┛┗┛┻┗┛┛┗ ┻
#

# This script is for backlight control using ddcutil (Optimized for Speed)

set -u

# Constants
STEP=20
VCP_CODE=10 # It means brightness in DDC/CI

IMAGE_DIR="$HOME/.config/hypr/icons"
CACHE_FILE="$HOME/.cache/hypr_ddcutil_buses"

# Get connected display I2C buses (cached for speed)
get_buses() {
    if [ ! -f "$CACHE_FILE" ]; then
        # Extract I2C bus numbers (e.g., "5" from "/dev/i2c-5")
        ddcutil detect | awk '/I2C bus:/ { split($NF, a, "-"); print a[2] }' > "$CACHE_FILE"
    fi
    cat "$CACHE_FILE"
}

# Clear cache manually if monitor setup changes
clear_cache() {
    rm -f "$CACHE_FILE"
    echo "Cache cleared. Next run will take a few seconds to detect monitors."
}

# Get icons
get_icon() {
    local current=$1
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
    local current=$1
    notify-send -e -h string:x-canonical-private-synchronous:brightness_notif -h int:value:$current -u low -n "$icon" "Brightness : $current%"
}

# Change brightness
change_brightness() {
    local delta="$1"
    local current
    local max=100
    local target
    local buses

    buses=$(get_buses)
    local first_bus=$(echo "$buses" | head -n 1)

    if [ -z "$first_bus" ]; then
        echo "No DDC/CI compatible displays found."
        return 1
    fi

    # 1. Get current brightness from ONLY the first monitor (Saves time)
    local info=$(ddcutil -b "$first_bus" getvcp "$VCP_CODE" --terse)
    current=$(echo "$info" | awk '{print $4}')
    max=$(echo "$info" | awk '{print $5}')

    if [ -z "$current" ]; then
        current=50 # Fallback
    fi
    if [ -z "$max" ]; then
        max=100
    fi

    # 2. Calculate target brightness
    target=$((current + delta))
    if [ "$target" -lt 0 ]; then
        target=0
    elif [ "$target" -gt "$max" ]; then
        target=$max
    fi

    # 3. Apply to all monitors in parallel (Saves time)
    for b in $buses; do
        ddcutil -b "$b" setvcp "$VCP_CODE" "$target" &
    done
    wait # Wait for all background tasks to finish

    # 4. Notify using the calculated target (Saves another read query)
    get_icon "$target"
    notify_user "$target"
}

case "$1" in
--get)
    buses=$(get_buses)
    for b in $buses; do
        val=$(ddcutil -b "$b" getvcp $VCP_CODE --terse | awk '{print $4}')
        echo "Bus $b: Brightness is $val%"
    done
    ;;
--get-first)
    buses=$(get_buses)
    first_bus=$(echo "$buses" | head -n 1)
    if [ -n "$first_bus" ]; then
        ddcutil -b "$first_bus" getvcp $VCP_CODE --terse | awk '{print $4}'
    else
        echo "0"
    fi
    ;;
--set)
    if [ -n "${2:-}" ]; then
        target="$2"
        buses=$(get_buses)
        for b in $buses; do
            ddcutil -b "$b" setvcp $VCP_CODE "$target" &
        done
    fi
    ;;
--inc)
    change_brightness "$STEP"
    ;;
--dec)
    change_brightness "-$STEP"
    ;;
--clear-cache)
    clear_cache
    ;;
*)
    echo "Usage: $0 {--get|--get-first|--set|--inc|--dec|--clear-cache}"
    exit 1
    ;;
esac
