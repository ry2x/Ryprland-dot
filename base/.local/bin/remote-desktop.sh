#!/usr/bin/env bash
# ┳┓┏┓┳┳┓┏┓┏┳┓┏┓  ┳┓┏┓┏┓┓┏┓┏┳┓┏┓┏┓
# ┣┫┣ ┃┃┃┃┃ ┃ ┣   ┃┃┣ ┗┓┃┫  ┃ ┃┃┃┃
# ┛┗┗┛┛ ┗┗┛ ┻ ┗┛  ┻┛┗┛┗┛┛┗┛ ┻ ┗┛┣┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -euo pipefail

SUNSHINE_SERVICE="ryprland-sunshine.service"
SCRIPT_DIR="$(dirname -- "$(readlink -f -- "${BASH_SOURCE[0]}")")"
CONTROLLER="${REMOTE_DESKTOP_BIN:-${XDG_DATA_HOME:-$HOME/.local/share}/ryprland-remote-desktop/ryprland-remote-desktop}"
export REMOTE_DESKTOP_HOOK="$SCRIPT_DIR/remote-desktop.sh"

help() {
    local title_color='' reset_color=''
    if [[ -t 1 && -z ${NO_COLOR+x} && ${TERM:-} != dumb ]]; then
        title_color=$'\033[1;34m'
        reset_color=$'\033[0m'
    fi

    printf '%s' "$title_color"
    cat <<'EOF'

▗▄▄▖     ▗▄▄▄▖    ▗▖  ▗▖     ▗▄▖     ▗▄▄▄▖    ▗▄▄▄▖        ▗▄▄▄      ▗▄▄▄▖     ▗▄▄▖    ▗▖ ▗▖    ▗▄▄▄▖     ▗▄▖     ▗▄▄▖
▐▌ ▐▌    ▐▌       ▐▛▚▞▜▌    ▐▌ ▐▌      █      ▐▌           ▐▌  █     ▐▌       ▐▌       ▐▌▗▞▘      █      ▐▌ ▐▌    ▐▌ ▐▌
▐▛▀▚▖    ▐▛▀▀▘    ▐▌  ▐▌    ▐▌ ▐▌      █      ▐▛▀▀▘        ▐▌  █     ▐▛▀▀▘     ▝▀▚▖    ▐▛▚▖       █      ▐▌ ▐▌    ▐▛▀▘
▐▌ ▐▌    ▐▙▄▄▖    ▐▌  ▐▌    ▝▚▄▞▘      █      ▐▙▄▄▖        ▐▙▄▄▀     ▐▙▄▄▖    ▗▄▄▞▘    ▐▌ ▐▌      █      ▝▚▄▞▘    ▐▌
EOF
    printf '%s' "$reset_color"
    cat <<'EOF'

Usage: remote-desktop.sh [options]

Options:
  -h, --help     Show this help message
  -s, --start    Start Sunshine in standby mode
  -t, --stop     Stop Sunshine and restore local displays
  --status       Show standby/streaming state
  --restore      Restore local displays without stopping Sunshine

  Internal hook options:
  --prepare, --serve, --enter, --release, --sync, --wake, --idle-off, --idle-dim, --idle-brightness, --idle-suspend, --remove-output
EOF
}

controller() {
    "$CONTROLLER" "$@"
}

case "${1:-}" in
    -h|--help)
        help
        ;;
    -s|--start)
        # The service's prepare hook needs the current compositor socket.
        systemctl --user import-environment WAYLAND_DISPLAY HYPRLAND_INSTANCE_SIGNATURE XDG_CURRENT_DESKTOP
        systemctl --user start "$SUNSHINE_SERVICE"
        echo "Remote desktop is ready in standby mode."
        ;;
    -t|--stop)
        # Never stop the separate login-screen Sunshine instance.
        systemctl --user stop "$SUNSHINE_SERVICE"
        controller --restore
        controller --remove-output
        echo "Remote desktop stopped; local displays restored."
        ;;
    --prepare|--serve|--enter|--release|--restore|--sync|--status|--wake|--idle-off|--idle-dim|--idle-brightness|--idle-suspend|--remove-output)
        if [[ ! -x "$CONTROLLER" ]]; then
            echo "Remote desktop controller is unavailable. Run ryprland deploy remote-desktop first." >&2
            exit 1
        fi
        exec "$CONTROLLER" "$1"
        ;;
    *)
        help >&2
        exit 1
        ;;
esac
