#!/usr/bin/env bash
#  ┳┳┓┏┓┏┳┓┳┳┏┓┏┓┳┓  ┳┳┓┏┓┏┓┳┏┓┓┏┓
#  ┃┃┃┣┫ ┃ ┃┃┃┓┣ ┃┃━━┃┃┃┣┫┃┓┃┃ ┃┫
#  ┛ ┗┛┗ ┻ ┗┛┗┛┗┛┛┗  ┛ ┗┛┗┗┛┻┗┛┛┗┛
#

# utility vars
DEFAULT_MATUGEN_CONFIG="$HOME/.config/matugen/config.toml"
IMG_DIR="$HOME/.config/rofi/images"
BG_DIR="$HOME/.local/share/bg"

# Parse arguments
mode="dark"
for arg in "$@"; do
    case "$arg" in
    --light) mode="light" ;;
    esac
done

# Check if waypaper command exists
if command -v waypaper >/dev/null 2>&1; then
    # Extract wallpaper path
    wallpaper_path=$(waypaper --list | jq -r '.[0].wallpaper')
else
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Waypaper command not found" -u critical
    exit 1
fi

# Check if wallpaper path is valid
if [ -z "$wallpaper_path" ] || [ ! -f "$wallpaper_path" ]; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Could not find valid wallpaper path: '$wallpaper_path'" -u critical
    exit 1
fi

# generate matugen colors
matugen image "$wallpaper_path" -m "$mode" -c "$DEFAULT_MATUGEN_CONFIG"

# set gtk theme
#gsettings set org.gnome.desktop.interface gtk-theme ""
#gsettings set org.gnome.desktop.interface gtk-theme Otis

#-------Imagemagick magick 👀--------------#

# Create rofi images directory if it doesn't exist
mkdir -p "$IMG_DIR"

# convert and resize the current wallpaper & make it image for rofi with blur
if ! magick "$wallpaper_path" -strip \
    \( -clone 0 -thumbnail 1000x1000^ -gravity center -extent 1000 -quality 70 \
    -write "$IMG_DIR/currentWal.thumb" \
    -blur 0x8 -write "$IMG_DIR/currentWalBlur.thumb" +delete \) \
    \( -clone 0 -thumbnail 500x500^ -gravity center -extent 500x500 \
    -write "$IMG_DIR/currentWal.sqre" \
    \( +clone -fill white -colorize 100 \
    -fill "gray(30%)" -draw "polygon 400,500 500,500 500,0 450,0" \
    -fill black -draw "polygon 500,500 500,0 450,500" \) \
    -alpha off -compose CopyOpacity -composite \
    -write png:"$IMG_DIR/currentWalQuad.quad" +delete \) \
    null:; then

    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif \
        "MatugenMagick Error" "Failed to create images" -u critical
    exit 1
fi

# copy the wallpaper in current-wallpaper file
mkdir -p "$(dirname "$BG_DIR")"
if ! ln -sf "$wallpaper_path" "$BG_DIR"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create symbolic link" -u critical
    exit 1
fi

# send notification after completion
msg=$'The wallpaper have been update to\n'"$wallpaper_path"
notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Complete" "$msg" -i "$HOME/.local/share/bg"
