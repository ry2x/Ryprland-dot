#!/usr/bin/env bash
# ┏┳┓┏┓┏┓┏┓┓ ┏┓  ┓ ┏┳┳┓┳┓┏┓┓ ┏
# ┃ ┃┃┃┓┃┓┃ ┣   ┃┃┃┃┃┃┃┃┃┃┃┃┃
# ┻ ┗┛┗┛┗┛┗┛┗┛  ┗┻┛┻┛┗┻┛┗┛┗┻┛

CLASS=$1
COMMAND=$2
TITLE=$3

if [[ -z "$CLASS" || -z "$COMMAND" ]]; then
    echo "Usage: $0 <window_class> <command> [title_regex]"
    exit 1
fi

# Check if any window with the specified class exists.
# When TITLE is provided, filter by class first and then by title regex.
if [[ -n "$TITLE" ]]; then
    clients=$(hyprctl clients -j | jq -r --arg CLASS "$CLASS" --arg TITLE "$TITLE" '.[] | select(.class == $CLASS) | select((.title // "") | test($TITLE)) | .address')
else
    clients=$(hyprctl clients -j | jq -r --arg CLASS "$CLASS" '.[] | select(.class == $CLASS) | .address')
fi


if [[ "$clients" == "" ]]; then
    $COMMAND
    exit 0
else
    hyprctl dispatch closewindow address:"$clients"
fi
