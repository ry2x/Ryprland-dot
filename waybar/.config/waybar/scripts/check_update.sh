#!/usr/bin/env bash

if ! updates=$(checkupdates 2> /dev/null); then
    updates=""
fi

if [ -z "$updates" ]; then
    counts=0
    tooltip="System is up to date"
else
    counts=$(echo "$updates" | wc -l)
    formatted_updates=$(echo "$updates" | sed 's/\\/\\\\/g' | sed 's/"/\\"/g' | awk '{printf "%s\\r", $0}' | sed 's/\\r$//')
    tooltip="Available Updates:\\r$formatted_updates"
fi

json='{"text": "'$counts'","alt": "'$counts'","tooltip": "'$tooltip'","class": "pacman"}'

echo $json

pkill -SIGRTMIN+8 waybar
