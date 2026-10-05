#!/usr/bin/env bash
# ┳┓┏┓┳┳┓┏┓┏┳┓┏┓  ┳┓┏┓┏┓┓┏┓┏┳┓┏┓┏┓
# ┣┫┣ ┃┃┃┃┃ ┃ ┣   ┃┃┣ ┗┓┃┫  ┃ ┃┃┃┃
# ┛┗┗┛┛ ┗┗┛ ┻ ┗┛  ┻┛┗┛┗┛┛┗┛ ┻ ┗┛┣┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -euo pipefail

SUNSHINE_SERVICE="ryprland-sunshine.service"
SCRIPT_DIR="$(dirname -- "$(readlink -f -- "${BASH_SOURCE[0]}")")"

help() {
    echo "Usage: $0 [OPTIONS]"
    echo "Keep Sunshine ready and isolate its remote display while streaming."
    echo "Options:"
    echo "  -h, --help     Show this help message"
    echo "  -s, --start    Start Sunshine in standby mode"
    echo "  -t, --stop     Stop Sunshine and restore local displays"
    echo "  --status       Show standby/streaming state"
    echo "  --restore      Restore local displays without stopping Sunshine"
    echo "Internal hooks: --prepare, --serve, --enter, --release, --sync,"
    echo "                --wake, --idle-off, --idle-dim, --idle-brightness, --idle-suspend, --remove-output"
}

controller() {
    python3 "$SCRIPT_DIR/remote-desktop.py" "$@"
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
        exec python3 "$SCRIPT_DIR/remote-desktop.py" "$1"
        ;;
    *)
        help >&2
        exit 1
        ;;
esac
