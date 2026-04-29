#!/usr/bin/env bash
# ┏┳┓┏┓┏┓┏┓┓ ┏┓  ┓ ┏┳┳┓┳┓┏┓┓ ┏
# ┃ ┃┃┃┓┃┓┃ ┣   ┃┃┃┃┃┃┃┃┃┃┃┃┃
# ┻ ┗┛┗┛┗┛┗┛┗┛  ┗┻┛┻┛┗┻┛┗┛┗┻┛

CLASS=$1
COMMAND=$2

if [[ -z "$CLASS" || -z "$COMMAND" ]]; then
    echo "Usage: $0 <window_class> <command>"
    exit 1
fi

# Check if any window with the specified class exists
clients=$(hyprctl clients -j | jq -r --arg CLASS "$CLASS" '.[] | select(.class == $CLASS) | .address')

if [[ "$clients" == "" ]]; then
    $COMMAND
    exit 0
else
    hyprctl dispatch closewindow class:"$CLASS"
fi
