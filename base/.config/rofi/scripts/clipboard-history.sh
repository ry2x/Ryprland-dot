#!/usr/bin/env bash

set -uo pipefail
#  ┏┓┓ ┳┏┓┓┏┳┏┓┏┳┓
#  ┃ ┃ ┃┃┃┣┫┃┗┓ ┃
#  ┗┛┗┛┻┣┛┛┗┻┗┛ ┻
#

## /* ---- 💫 https://github.com/JaKooLit 💫 ---- */  ##
# Clipboard Manager. This script uses cliphist, rofi, and wl-copy.

# Actions:
# CTRL Del to delete an entry
# ALT  Del to wipe clipboard contents

theme="$HOME/.config/rofi/themes/clipboard-history.rasi"

for command in cliphist rofi wl-copy; do
    command -v "$command" >/dev/null 2>&1 || {
        printf 'clipboard-history: required command not found: %s\n' "$command" >&2
        exit 1
    }
done

while true; do
    # Run rofi and capture both the result string and its exit status
    if result=$(
        rofi -i -dmenu \
            -kb-custom-1 "Control-Delete" \
            -kb-custom-2 "ALT-Delete" \
            -config "$theme" < <(cliphist list)
    ); then
        status=0
    else
        status=$?
    fi

    case "$status" in
    1)
        # rofi was cancelled (Esc)
        exit
        ;;
    0)
        case "$result" in
        "")
            # empty selection, reopen
            continue
            ;;
        *)
            # normal selection: copy to clipboard and exit
            cliphist decode <<<"$result" | wl-copy
            exit
            ;;
        esac
        ;;
    10)
        # Control-Delete: delete entry and reopen
        cliphist delete <<<"$result"
        ;;
    11)
        # ALT-Delete: wipe history and reopen
        cliphist wipe
        ;;
    *)
        # Any other unexpected exit status (including signal-terminated codes >=128)
        # should cause the script to exit instead of immediately restarting rofi.
        # This prevents rapid respawn when rofi is killed via pkill.
        if [ "$status" -ge 128 ] 2>/dev/null; then
            exit "$status"
        else
            # For any other unknown non-zero code, exit as well to be safe.
            exit "$status"
        fi
        ;;
    esac
done
