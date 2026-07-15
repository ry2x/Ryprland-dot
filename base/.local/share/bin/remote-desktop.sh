#!/usr/bin/env bash

set -euo pipefail

# ┳┓┏┓┳┳┓┏┓┏┳┓┏┓  ┳┓┏┓┏┓┓┏┓┏┳┓┏┓┏┓
# ┣┫┣ ┃┃┃┃┃ ┃ ┣   ┃┃┣ ┗┓┃┫  ┃ ┃┃┃┃
# ┛┗┗┛┛ ┗┗┛ ┻ ┗┛  ┻┛┗┛┗┛┛┗┛ ┻ ┗┛┣┛

OUTPUT_NAME="RMT-1"
OUTPUT_MODE="1920x1080@60"

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
    pgrep -x sunshine >/dev/null
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

    hyprctl eval "hl.monitor({
        output = \"$OUTPUT_NAME\",
        mode = \"$OUTPUT_MODE\",
        scale = \"1\",
        position = \"auto\"
    })" >/dev/null
    echo "Headless output ${OUTPUT_NAME} is configured."

    if ! is_running; then
        nohup sunshine >/dev/null 2>&1 < /dev/null &
        echo "Remote desktop application started."
    else
        echo "Remote desktop application is already running."
    fi
}

stop() {
    echo "Stopping remote desktop application..."

    require_cmd hyprctl
    require_cmd systemctl

    if is_running; then
        pkill -x sunshine
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
