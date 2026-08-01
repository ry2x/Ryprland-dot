#!/usr/bin/env bash
#  ┓ ┏┓┳┳┳┓┏┓┓┏┏┓┳┓
#  ┃ ┣┫┃┃┃┃┃ ┣┫┣ ┣┫
#  ┗┛┛┗┗┛┛┗┗┛┛┗┗┛┛┗
#

# Style-dir
style_dir="$HOME/.config/rofi/launchers/styles"

# Style-theme
style_theme='style-12'

# Run
rofi -show drun -scroll-method 1 -theme "${style_dir}/${style_theme}.rasi"
