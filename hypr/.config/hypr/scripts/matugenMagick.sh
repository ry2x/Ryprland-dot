#!/usr/bin/env bash
#  ┳┳┓┏┓┏┳┓┳┳┏┓┏┓┳┓  ┳┳┓┏┓┏┓┳┏┓┓┏┓
#  ┃┃┃┣┫ ┃ ┃┃┃┓┣ ┃┃━━┃┃┃┣┫┃┓┃┃ ┃┫
#  ┛ ┗┛┗ ┻ ┗┛┗┛┗┛┛┗  ┛ ┗┛┗┗┛┻┗┛┛┗┛
#

# utility vars
config_file="$HOME/.config/waypaper/config.ini"
matugen_config="$HOME/.config/matugen/hyprland.toml"
default_matugen_config="$HOME/.config/matugen/config.toml"

# Parse arguments
mode="dark"
for arg in "$@"; do
    case "$arg" in
        --light) mode="light" ;;
    esac
done

# Check if config file exists and extract wallpaper path correctly
if [ -f "$config_file" ]; then
    # Extract wallpaper path (handles quotes and whitespace)
    wallpaper_path=$(grep "wallpaper =" "$config_file" | cut -d '=' -f2- | xargs)

    wallpaper_path="${wallpaper_path/#~/$HOME}"
else
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Config file $config_file not found" -u critical
    exit 1
fi

# Check if wallpaper path is valid
if [ -z "$wallpaper_path" ] || [ ! -f "$wallpaper_path" ]; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Could not find valid wallpaper path: '$wallpaper_path'" -u critical
    exit 1
fi

# generate matugen colors
if [ "$mode" = "light" ]; then
    matugen image "$wallpaper_path" -m "light" -c "$default_matugen_config"
    sleep 0.5
    matugen image "$wallpaper_path" -m "light" -c "$matugen_config"
else
    matugen image "$wallpaper_path" -m "dark" -c "$default_matugen_config"
    sleep 0.5
    matugen image "$wallpaper_path" -m "dark" -c "$matugen_config"
fi

# set gtk theme
#gsettings set org.gnome.desktop.interface gtk-theme ""
#gsettings set org.gnome.desktop.interface gtk-theme Otis

#-------Imagemagick magick 👀--------------#

# Create rofi images directory if it doesn't exist
mkdir -p "$HOME/.config/rofi/images"

# convert and resize the current wallpaper & make it image for rofi with blur
if ! magick "$wallpaper_path" -strip -resize 1000 -gravity center -extent 1000 -blur "30x30" -quality 90 "$HOME/.config/rofi/images/currentWalBlur.thumb"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create blurred thumbnail" -u critical
    exit 1
fi

# convert and resize the current wallpaper & make it image for rofi without blur
if ! magick "$wallpaper_path" -strip -resize 1000 -gravity center -extent 1000 -quality 90 "$HOME/.config/rofi/images/currentWal.thumb"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create normal thumbnail" -u critical
    exit 1
fi

# convert and resize the current wallpaper & make it image for rofi with square format
if ! magick "$wallpaper_path" -strip -thumbnail 500x500^ -gravity center -extent 500x500 "$HOME/.config/rofi/images/currentWal.sqre"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create square thumbnail" -u critical
    exit 1
fi

# convert and resize the square formatted & make it image for rofi with drawing polygon
if ! magick "$HOME/.config/rofi/images/currentWal.sqre" \( -size 500x500 xc:white -fill "rgba(0,0,0,0.7)" -draw "polygon 400,500 500,500 500,0 450,0" -fill black -draw "polygon 500,500 500,0 450,500" \) -alpha Off -compose CopyOpacity -composite "$HOME/.config/rofi/images/currentWalQuad.png"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create polygon thumbnail" -u critical
    exit 1
fi

if ! mv "$HOME/.config/rofi/images/currentWalQuad.png" "$HOME/.config/rofi/images/currentWalQuad.quad"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to rename polygon thumbnail" -u critical
    exit 1
fi

# copy the wallpaper in current-wallpaper file
mkdir -p "$(dirname "$HOME/.local/share/bg")"
if ! ln -sf "$wallpaper_path" "$HOME/.local/share/bg"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create symbolic link" -u critical
    exit 1
fi

# send notification after completion
notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick" "Matugen & ImageMagick has completed its job" -i "$HOME/.local/share/bg"
