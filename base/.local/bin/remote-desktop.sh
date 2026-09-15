#!/usr/bin/env bash
# ┳┓┏┓┳┳┓┏┓┏┳┓┏┓  ┳┓┏┓┏┓┓┏┓┏┳┓┏┓┏┓
# ┣┫┣ ┃┃┃┃┃ ┃ ┣   ┃┃┣ ┗┓┃┫  ┃ ┃┃┃┃
# ┛┗┗┛┛ ┗┗┛ ┻ ┗┛  ┻┛┗┛┗┛┛┗┛ ┻ ┗┛┣┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -euo pipefail

OUTPUT_NAME="RMT-1"
SUNSHINE_SERVICE="ryprland-sunshine.service"

help() {
    echo "Usage: $0 [OPTIONS]"
    echo "Set up a headless output for remote desktop access using Sunshine."
    echo "Options:"
    echo "  -h, --help    Show this help message and exit"
    echo "  -s, --start   Start the remote desktop service"
    echo "  -t, --stop    Stop the remote desktop service"
    echo "  --prepare    Ensure the headless output is ready (service hook)"
}

die() {
    echo "Error: $*" >&2
    exit 1
}

require_cmd() {
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

output_exists() {
    hyprctl -j monitors 2>/dev/null | jq -e --arg name "$OUTPUT_NAME" \
        '.[] | select(.name == $name and .width > 0 and .height > 0)' >/dev/null
}

is_running() {
    systemctl --user is-active --quiet "$SUNSHINE_SERVICE"
}

prepare() {
    echo "Setting up headless output for remote desktop access..."

    require_cmd hyprctl
    require_cmd jq
    require_cmd flock

    # Concurrent service/manual starts must not create two headless outputs.
    exec 9>"${XDG_RUNTIME_DIR:?}/ryprland-remote-output.lock"
    flock -w 10 9 || die "Timed out waiting for remote output setup"

    if output_exists; then
        echo "Headless output ${OUTPUT_NAME} already exists."
    else
        hyprctl output create headless "${OUTPUT_NAME}" >/dev/null
    fi

    for ((attempt = 0; attempt < 50; attempt++)); do
        if output_exists; then
            echo "Headless output ${OUTPUT_NAME} is configured."
            flock -u 9
            exec 9>&-
            return 0
        fi
        sleep 0.1
    done
    die "Headless output ${OUTPUT_NAME} did not become ready"
}

start() {
    require_cmd systemctl
    prepare
    # Pass the current compositor socket before the service's --prepare hook.
    systemctl --user import-environment WAYLAND_DISPLAY HYPRLAND_INSTANCE_SIGNATURE XDG_CURRENT_DESKTOP

    if ! is_running; then
        systemctl --user start "$SUNSHINE_SERVICE"
        echo "Remote desktop application started."
    else
        echo "Remote desktop application is already running."
    fi
}

stop() {
    echo "Stopping remote desktop application..."

    require_cmd hyprctl
    require_cmd systemctl
    require_cmd jq

    # Stop even an activating service; never kill the separate login streamer.
    systemctl --user stop "$SUNSHINE_SERVICE"
    echo "Remote desktop application stopped."

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
    --prepare)
        prepare
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
