#!/usr/bin/env bash

# ┳┓┏┓┓ ┏┓┏┓┳┓  ┳┳┓┏┓┏┳┓┳┳┏┓┏┓┳┓
# ┣┫┣ ┃ ┃┃┣┫┃┃  ┃┃┃┣┫ ┃ ┃┃┃┓┣ ┃┃
# ┛┗┗┛┗┛┗┛┛┗┻┛  ┛ ┗┛┗ ┻ ┗┛┗┛┗┛┛┗

configDir="$HOME/.config/waypaper/config.ini"
scriptsDir="$HOME/.config/hypr/scripts"

# Run matugen script
[[ -n "$configDir" ]] && "$scriptsDir/matugenMagick.sh" --dark
