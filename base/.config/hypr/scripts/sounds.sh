#!/usr/bin/env bash
#  ┏┓┏┓┳┳┳┓┳┓┏┓┓┏┏┓┏┳┓
#  ┗┓┃┃┃┃┃┃┃┃┗┓┣┫┃┃ ┃
#  ┗┛┗┛┗┛┛┗┻┛┗┛┛┗┗┛ ┻
#

# /* ---- 💫 https://github.com/JaKooLit 💫 ---- */  ##
# This script is used to play system sounds.

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================
readonly THEME="freedesktop"
readonly DEFAULT_THEME="freedesktop"
readonly USER_SOUNDS_DIR="$HOME/.local/share/sounds"
readonly SYSTEM_SOUNDS_DIR="/usr/share/sounds"

# Global mute controls
readonly MUTE_ALL=false
readonly MUTE_SCREENSHOTS=false
readonly MUTE_VOLUME=false

# ============================================================================
# Helper Functions
# ============================================================================

error() {
    echo "Error: $*" >&2
    exit 1
}

command_exists() {
    command -v "$1" >/dev/null 2>&1
}

check_dependencies() {
    local missing=()

    for cmd in pw-play find awk; do
        if ! command_exists "$cmd"; then
            missing+=("$cmd")
        fi
    done

    if ((${#missing[@]} > 0)); then
        error "Missing required commands: ${missing[*]}"
    fi
}

print_help() {
    cat <<'EOF'
Available sounds:
  --screenshot
  --volume
  --help
EOF
}

get_inherits_theme() {
    local theme_dir="$1"
    local index_file="$theme_dir/index.theme"

    if [[ ! -f "$index_file" ]]; then
        return 0
    fi

    awk -F '=' 'tolower($1) == "inherits" {gsub(/^[ \t]+|[ \t]+$/, "", $2); print $2; exit}' "$index_file"
}

find_sound_in_dir() {
    local base_dir="$1"
    local pattern="$2"

    if [[ -d "$base_dir/stereo" ]]; then
        find "$base_dir/stereo" -name "$pattern" -print -quit 2>/dev/null
    fi
}

resolve_theme_dir() {
    if [[ -d "$USER_SOUNDS_DIR/$THEME" ]]; then
        echo "$USER_SOUNDS_DIR/$THEME"
    elif [[ -d "$SYSTEM_SOUNDS_DIR/$THEME" ]]; then
        echo "$SYSTEM_SOUNDS_DIR/$THEME"
    else
        echo "$SYSTEM_SOUNDS_DIR/$DEFAULT_THEME"
    fi
}

resolve_sound_pattern() {
    local mode="$1"

    case "$mode" in
    --screenshot)
        if [[ "$MUTE_SCREENSHOTS" == true ]]; then
            exit 0
        fi
        echo "screen-capture.*"
        ;;
    --volume)
        if [[ "$MUTE_VOLUME" == true ]]; then
            exit 0
        fi
        echo "audio-volume-change.*"
        ;;
    esac
}

find_sound_file() {
    local sound_pattern="$1"
    local theme_dir="$2"
    local inherited_theme
    local sound_file=""

    # 1) Current selected theme
    sound_file="$(find_sound_in_dir "$theme_dir" "$sound_pattern")"
    if [[ -n "$sound_file" && -f "$sound_file" ]]; then
        echo "$sound_file"
        return 0
    fi

    # 2) Inherited theme from index.theme
    inherited_theme="$(get_inherits_theme "$theme_dir")"
    if [[ -n "$inherited_theme" ]]; then
        sound_file="$(find_sound_in_dir "$SYSTEM_SOUNDS_DIR/$inherited_theme" "$sound_pattern")"
        if [[ -n "$sound_file" && -f "$sound_file" ]]; then
            echo "$sound_file"
            return 0
        fi

        sound_file="$(find_sound_in_dir "$USER_SOUNDS_DIR/$inherited_theme" "$sound_pattern")"
        if [[ -n "$sound_file" && -f "$sound_file" ]]; then
            echo "$sound_file"
            return 0
        fi
    fi

    # 3) Default theme fallback
    sound_file="$(find_sound_in_dir "$USER_SOUNDS_DIR/$DEFAULT_THEME" "$sound_pattern")"
    if [[ -n "$sound_file" && -f "$sound_file" ]]; then
        echo "$sound_file"
        return 0
    fi

    sound_file="$(find_sound_in_dir "$SYSTEM_SOUNDS_DIR/$DEFAULT_THEME" "$sound_pattern")"
    if [[ -n "$sound_file" && -f "$sound_file" ]]; then
        echo "$sound_file"
        return 0
    fi

    return 1
}

main() {
    local mode="${1:-}"
    local theme_dir
    local sound_pattern
    local sound_file

    if [[ "$MUTE_ALL" == true ]]; then
        exit 0
    fi

    case "$mode" in
    --help | -h | "")
        print_help
        exit 0
        ;;
    --screenshot)
        if [[ "$MUTE_SCREENSHOTS" == true ]]; then
            exit 0
        fi
        ;;
    --volume)
        if [[ "$MUTE_VOLUME" == true ]]; then
            exit 0
        fi
        ;;
    *)
        print_help
        exit 0
        ;;
    esac

    check_dependencies

    sound_pattern="$(resolve_sound_pattern "$mode")"
    theme_dir="$(resolve_theme_dir)"

    if ! sound_file="$(find_sound_file "$sound_pattern" "$theme_dir")"; then
        error "Sound file not found for pattern: $sound_pattern"
    fi

    pw-play "$sound_file"
}

main "$@"
