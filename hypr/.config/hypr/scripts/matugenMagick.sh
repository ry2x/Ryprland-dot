#!/usr/bin/env bash
#  ┳┳┓┏┓┏┳┓┳┳┏┓┏┓┳┓  ┳┳┓┏┓┏┓┳┏┓┓┏┓
#  ┃┃┃┣┫ ┃ ┃┃┃┓┣ ┃┃━━┃┃┃┣┫┃┓┃┃ ┃┫ 
#  ┛ ┗┛┗ ┻ ┗┛┗┛┗┛┛┗  ┛ ┗┛┗┗┛┻┗┛┛┗┛
#                                 




# utility vars
cache_dir="$HOME/.cache/swww/"
current_monitor=$(hyprctl monitors | awk '/^Monitor/{name=$2} /focused: yes/{print name}')
cache_file="$cache_dir$current_monitor"

# Check if cache file exists and extract wallpaper path correctly
if [ -f "$cache_file" ]; then
    # Extract the wallpaper path from binary cache file (skip null bytes and 'Lanczos3')
    wallpaper_path=$(strings "$cache_file" | grep -E '\.(jpg|jpeg|png|webp|bmp)$' | head -n 1)
else
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Cache file $cache_file not found" -u critical
    exit 1
fi

# Check if wallpaper path is valid
if [ -z "$wallpaper_path" ] || [ ! -f "$wallpaper_path" ]; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Could not find valid wallpaper path: '$wallpaper_path'" -u critical
    exit 1
fi

# generate matugen colors
if [ "$1" == "--light" ]; then
  matugen image "$wallpaper_path" -m "light"
else
  matugen image "$wallpaper_path" -m "dark"
fi 

# set gtk theme
gsettings set org.gnome.desktop.interface gtk-theme ""
gsettings set org.gnome.desktop.interface gtk-theme adw-gtk3

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
