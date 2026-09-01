#!/usr/bin/env bash
# ┳┓┏┓┳┳┓┏┓┏┳┓┏┓  ┳┓┏┓┏┓┓┏┓┏┳┓┏┓┏┓
# ┣┫┣ ┃┃┃┃┃ ┃ ┣   ┃┃┣ ┗┓┃┫  ┃ ┃┃┃┃
# ┛┗┗┛┛ ┗┗┛ ┻ ┗┛  ┻┛┗┛┗┛┛┗┛ ┻ ┗┛┣┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -euo pipefail

OUTPUT_NAME="RMT-1"
OUTPUT_MODE="1920x1080@60"
SUNSHINE_SERVICE="app-dev.lizardbyte.app.Sunshine.service"

help() {
    echo "Usage: $0 [OPTIONS]"
    echo "Set up a headless output for remote desktop access using Sunshine."
    echo "Options:"
    echo "  -h, --help    Show this help message and exit"
    echo "  -s, --start   Start the remote desktop service"
    echo "  -t, --stop    Stop the remote desktop service"
}

die() {
    echo "Error: $*" >&2
    exit 1
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

output_exists() {
    hyprctl -j monitors all 2>/dev/null | grep -Eq "\"name\"[[:space:]]*:[[:space:]]*\"${OUTPUT_NAME}\""
}

is_running() {
    systemctl --user is-active --quiet "$SUNSHINE_SERVICE" || pgrep -x sunshine >/dev/null
}

reload_ags() {
    ~/.config/hypr/scripts/restartRystalShell.sh >/dev/null 2>&1
}

start() {
    echo "Setting up headless output for remote desktop access..."

    require_cmd hyprctl
    require_cmd systemctl

    if output_exists; then
        echo "Headless output ${OUTPUT_NAME} already exists."
    else
        hyprctl output create headless "${OUTPUT_NAME}" >/dev/null

        # Give Hyprland a short moment to register the new output.
        sleep 0.2
    fi

    echo "Headless output ${OUTPUT_NAME} is configured."

    if ! is_running; then
        systemctl --user start "$SUNSHINE_SERVICE"
        echo "Remote desktop application started."
    else
        echo "Remote desktop application is already running."
    fi

    reload_ags
}

stop() {
    echo "Stopping remote desktop application..."

    require_cmd hyprctl
    require_cmd systemctl

    if is_running; then
        systemctl --user stop "$SUNSHINE_SERVICE"
        pkill -x sunshine 2>/dev/null || true
        echo "Remote desktop application stopped."
    else
        echo "Remote desktop application is already stopped."
    fi

    if output_exists; then
        hyprctl output remove "${OUTPUT_NAME}" >/dev/null
        echo "Headless output ${OUTPUT_NAME} removed."
    else
        echo "Headless output ${OUTPUT_NAME} is already absent."
    fi

    reload_ags
}

arg="${1:-}"

case "$arg" in
    "")
        echo "No option provided." >&2
        echo "See help: $0 --help" >&2
        help
        exit 1
        ;;
    -h|--help)
        help
        exit 0
        ;;
    -s|--start)
        start
        exit 0
        ;;
    -t|--stop)
        stop
        exit 0
        ;;
    *)
        echo "Invalid option: ${arg}" >&2
        echo "See help: $0 --help" >&2
        help
        exit 1
        ;;
esac
