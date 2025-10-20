#!/bin/bash

# ディレクトリのパス
WALLPAPER_DIR="$HOME/Pictures/wallpapers"

# swww-daemon が起動していなければ起動
pgrep -x swww-daemon > /dev/null || swww-daemon &

# 壁紙をランダムに選択
WALLPAPER=$(find "$WALLPAPER_DIR" -type f | shuf -n 1)

# 壁紙を適用（アニメーション付き）
swww img "$WALLPAPER" --transition-type grow --transition-duration 1.0

# Create rofi images directory if it doesn't exist
mkdir -p "$HOME/.config/rofi/images"

# convert and resize the current wallpaper & make it image for rofi with blur
if ! magick "$WALLPAPER" -strip -resize 1000 -gravity center -extent 1000 -blur "30x30" -quality 90 "$HOME/.config/rofi/images/currentWalBlur.thumb"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create blurred thumbnail" -u critical
    exit 1
fi

# convert and resize the current wallpaper & make it image for rofi without blur
if ! magick "$WALLPAPER" -strip -resize 1000 -gravity center -extent 1000 -quality 90 "$HOME/.config/rofi/images/currentWal.thumb"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create normal thumbnail" -u critical
    exit 1
fi

# convert and resize the current wallpaper & make it image for rofi with square format
if ! magick "$WALLPAPER" -strip -thumbnail 500x500^ -gravity center -extent 500x500 "$HOME/.config/rofi/images/currentWal.sqre"; then
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
if ! ln -sf "$WALLPAPER" "$HOME/.local/share/bg"; then
    notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick Error" "Failed to create symbolic link" -u critical
    exit 1
fi

# send notification after completion
notify-send -e -h string:x-canonical-private-synchronous:matugen_notif "MatugenMagick" "Matugen & ImageMagick has completed its job" -i "$HOME/.local/share/bg"

