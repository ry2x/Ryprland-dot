#!/usr/bin/env bash
#  ┓ ┏┏┓┳┓┏┓┏┓┏┓┳┓┏┓┓┏
#  ┃┃┃┣ ┣┫┗┓┣ ┣┫┣┫┃ ┣┫
#  ┗┻┛┗┛┻┛┗┛┗┛┛┗┛┗┗┛┛┗
#

# Rofi config
rofiTheme="$HOME/.config/rofi/applets/webSearch.rasi"

# Websites
option_1=" 󰗃 "
option_2="  "

# Rofi CMD
rofi_cmd() {
    rofi -markup-rows -dmenu -theme ${rofiTheme}
}

# Pass variables to rofi dmenu
run_rofi() {
    echo -e "$option_1\n$option_2" | rofi_cmd
}

# Execute Command
run_cmd() {
    if [[ "$1" == '--opt1' ]]; then
        kitty --title "YouTube" -e yt-x
    elif [[ "$1" == '--opt2' ]]; then
        #xdg-open 'https://google.com/'
        brave --enable-wayland-ime --disable-features=WaylandWpColorManagerV1
    fi
}

# Actions
chosen="$(run_rofi)"
case ${chosen} in
$option_1)
    run_cmd --opt1
    ;;
$option_2)
    run_cmd --opt2
    ;;
esac
