#!/usr/bin/env bash
#  ┏┓┏┓┳┓┏┓┏┓┳┓┏┓┓┏┏┓┏┳┓
#  ┗┓┃ ┣┫┣ ┣ ┃┃┗┓┣┫┃┃ ┃
#  ┗┛┗┛┛┗┗┛┗┛┛┗┗┛┛┗┗┛ ┻
#
# Screenshot utility for Hyprland
# Recommended: hyprcrop (https://github.com/ry2x/hyprcrop) for better UX
# This script supports: fullscreen, window capture, and cropped region capture
#
# Usage: screenshot.sh [--crop|--window]

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================
SCREENSHOT_DIR="$HOME/Pictures/Screenshots"
SCREENSHOT_FILE="grim-$(date +%Y-%m-%d_%H%M%S).png"
SCREENSHOT_PATH="$SCREENSHOT_DIR/$SCREENSHOT_FILE"

# Required commands for different operations
declare -A REQUIRED_COMMANDS=(
    [base]="grim notify-send wl-copy"
    [crop]="slurp"
    [window]="hyprctl jq"
)

# ============================================================================
# Helper Functions
# ============================================================================

# Print error message and exit
error() {
    echo "Error: $*" >&2
    exit 1
}

# Check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check all required dependencies
check_dependencies() {
    local mode="$1"
    local missing_commands=()

    # Check base commands
    for cmd in ${REQUIRED_COMMANDS[base]}; do
        if ! command_exists "$cmd"; then
            missing_commands+=("$cmd")
        fi
    done

    # Check mode-specific commands
    if [[ -n "$mode" ]] && [[ -v "REQUIRED_COMMANDS[$mode]" ]]; then
        for cmd in ${REQUIRED_COMMANDS[$mode]}; do
            if ! command_exists "$cmd"; then
                missing_commands+=("$cmd")
            fi
        done
    fi

    if (( ${#missing_commands[@]} > 0 )); then
        error "Missing required commands: ${missing_commands[*]}"
    fi
}

# Create screenshot directory if it doesn't exist
ensure_screenshot_dir() {
    if ! mkdir -p "$SCREENSHOT_DIR"; then
        error "Cannot create screenshot directory: $SCREENSHOT_DIR"
    fi
}

# Send notification with screenshot preview
notify_screenshot() {
    local message="$1"
    notify-send "📸 $message" -u low -i "$SCREENSHOT_PATH"
}

# Copy file to clipboard
copy_to_clipboard() {
    if ! wl-copy <"$1"; then
        error "Failed to copy screenshot to clipboard"
    fi
}

# ============================================================================
# Capture Functions
# ============================================================================

# Capture fullscreen
capture_fullscreen() {
    echo "Capturing fullscreen..."
    if ! grim "$SCREENSHOT_PATH"; then
        error "Failed to capture fullscreen"
    fi
    notify_screenshot "Screenshot Captured!"
}

# Capture cropped region
capture_crop() {
    echo "Capturing cropped region (select area with mouse)..."
    local geometry
    geometry=$(slurp -d) || error "Crop selection cancelled"

    if ! grim -g "$geometry" "$SCREENSHOT_PATH"; then
        error "Failed to capture cropped region"
    fi
    notify_screenshot "Crop Screenshot Captured!"
}

# Capture active window
capture_window() {
    echo "Capturing active window..."

    # Query active window geometry from Hyprland
    local geom
    geom=$(hyprctl activewindow -j | jq -r '.at[0] as $x | .at[1] as $y | .size[0] as $w | .size[1] as $h | "\($x),\($y) \($w)x\($h)"') \
        || error "Failed to query window geometry"

    if [[ -z "$geom" || "$geom" == "null" ]]; then
        error "No active window geometry found (is Hyprland running?)"
    fi

    if ! grim -g "$geom" "$SCREENSHOT_PATH"; then
        error "Failed to capture active window"
    fi
    notify_screenshot "Window Screenshot Captured!"
}

# ============================================================================
# Main
# ============================================================================

main() {
    local mode="${1:-fullscreen}"

    case "$mode" in
        --crop)
            check_dependencies "crop"
            ensure_screenshot_dir
            capture_crop
            ;;
        --window)
            check_dependencies "window"
            ensure_screenshot_dir
            capture_window
            ;;
        --help|-h)
            cat <<EOF
Usage: $(basename "$0") [--crop|--window]

Options:
  --crop       Capture a cropped region (interactive selection)
  --window     Capture the currently active window
  --help       Show this help message

Default: Capture fullscreen

Examples:
  $(basename "$0")          # Fullscreen capture
  $(basename "$0") --crop   # Cropped region capture
  $(basename "$0") --window # Active window capture
EOF
            exit 0
            ;;
        *)
            check_dependencies ""
            ensure_screenshot_dir
            capture_fullscreen
            ;;
    esac

    # Copy to clipboard and confirm success
    copy_to_clipboard "$SCREENSHOT_PATH"
    echo "Screenshot saved: $SCREENSHOT_PATH"
}

main "$@"
