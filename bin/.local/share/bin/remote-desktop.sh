#!/usr/bin/env bash

set -euo pipefail

# ┳┓┏┓┳┳┓┏┓┏┳┓┏┓  ┳┓┏┓┏┓┓┏┓┏┳┓┏┓┏┓
# ┣┫┣ ┃┃┃┃┃ ┃ ┣   ┃┃┣ ┗┓┃┫  ┃ ┃┃┃┃
# ┛┗┗┛┛ ┗┗┛ ┻ ┗┛  ┻┛┗┛┗┛┛┗┛ ┻ ┗┛┣┛

OUTPUT_NAME="RMT-1"
OUTPUT_MODE="1355x768@60"
SERVICE_NAME="sunshine"

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

    hyprctl keyword monitor "${OUTPUT_NAME},${OUTPUT_MODE},auto,1" >/dev/null

    echo "Headless output ${OUTPUT_NAME} is configured."

    systemctl --user start "${SERVICE_NAME}"

    echo "Remote desktop service started."
}

stop() {
    echo "Stopping remote desktop service..."

    require_cmd hyprctl
    require_cmd systemctl

    if systemctl --user is-active --quiet "${SERVICE_NAME}"; then
        systemctl --user stop "${SERVICE_NAME}"
        echo "Remote desktop service stopped."
    else
        echo "Remote desktop service is already stopped."
    fi

    if output_exists; then
        hyprctl output remove "${OUTPUT_NAME}" >/dev/null
        echo "Headless output ${OUTPUT_NAME} removed."
    else
        echo "Headless output ${OUTPUT_NAME} is already absent."
    fi
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
