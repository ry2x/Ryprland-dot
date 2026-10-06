#!/usr/bin/env bash

# ┏┓┓┏┏┓┳┓┏┓┏┓  ┓ ┏┏┓┓ ┓ ┏┓┏┓┏┓┏┓┳┓
# ┃ ┣┫┣┫┃┃┃┓┣   ┃┃┃┣┫┃ ┃ ┃┃┣┫┃┃┣ ┣┫
# ┗┛┛┗┛┗┛┗┗┛┗┛  ┗┻┛┛┗┗┛┗┛┣┛┛┗┣┛┗┛┛┗

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -euo pipefail

usage() {
    printf 'Usage: ryprland set greeter-background IMAGE\n'
    printf 'Convert an image to PNG and apply it as the ReGreet login screen background.\n'
}

if (( $# == 1 )) && [[ "$1" == -h || "$1" == --help ]]; then
    usage
    exit 0
fi
if (( $# != 1 )); then
    usage >&2
    exit 1
fi

image_path="$(readlink -f -- "$1")"
if [[ ! -f "$image_path" || ! -r "$image_path" ]]; then
    printf 'Image is not a readable file: %s\n' "$1" >&2
    exit 1
fi
if ! command -v magick >/dev/null 2>&1; then
    printf 'Missing dependency: magick (install imagemagick).\n' >&2
    exit 1
fi

destination_dir="/usr/share/backgrounds"
destination="$destination_dir/greeter.png"
temporary_dir="$(mktemp -d "${TMPDIR:-/tmp}/ryprland-greeter.XXXXXX")"
temporary_destination=""
root_command=()
if (( EUID != 0 )); then
    root_command=(sudo)
fi

cleanup() {
    rm -rf -- "$temporary_dir"
    if [[ -n "$temporary_destination" ]]; then
        "${root_command[@]}" rm -f -- "$temporary_destination"
    fi
}
trap cleanup EXIT

# Decode as the calling user before requesting privileges. Use the first frame.
magick "${image_path}[0]" -auto-orient -strip "PNG:$temporary_dir/greeter.png"

"${root_command[@]}" install -d -m 0755 -- "$destination_dir"
temporary_destination="$("${root_command[@]}" mktemp "$destination_dir/.greeter.XXXXXX")"
"${root_command[@]}" install -m 0644 -- "$temporary_dir/greeter.png" "$temporary_destination"
"${root_command[@]}" mv -fT -- "$temporary_destination" "$destination"
temporary_destination=""

printf 'Applied login screen background: %s\n' "$image_path"
printf 'ReGreet will use it when the login screen next starts.\n'
