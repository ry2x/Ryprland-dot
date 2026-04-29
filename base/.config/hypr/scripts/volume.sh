#!/usr/bin/env bash

set -euo pipefail

# ============================================================================
# Configuration
# ============================================================================
readonly ICON_DIR="$HOME/.config/swaync/icons"
readonly SCRIPT_DIR="$HOME/.config/hypr/scripts"
readonly SOUND_SCRIPT="$SCRIPT_DIR/sounds.sh"
readonly SINK="@DEFAULT_AUDIO_SINK@"
readonly SOURCE="@DEFAULT_AUDIO_SOURCE@"
readonly STEP="5%"

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

    for cmd in wpctl awk grep; do
        if ! command_exists "$cmd"; then
            missing+=("$cmd")
        fi
    done

    if (( ${#missing[@]} > 0 )); then
        error "Missing required commands: ${missing[*]}"
    fi
}

check_action_dependencies() {
    local missing=()

    for cmd in notify-send; do
        if ! command_exists "$cmd"; then
            missing+=("$cmd")
        fi
    done

    if (( ${#missing[@]} > 0 )); then
        error "Missing required commands for actions: ${missing[*]}"
    fi
}

get_volume_state() {
    local target="$1"
    wpctl get-volume "$target"
}

is_muted() {
    local target="$1"
    get_volume_state "$target" | grep -q '\[MUTED\]'
}

get_percent() {
    local target="$1"
    get_volume_state "$target" | awk '{print int($2 * 100)}'
}

get_level_label() {
    local target="$1"
    local percent

    if is_muted "$target"; then
        echo "Muted"
        return 0
    fi

    percent="$(get_percent "$target")"
    echo "${percent}%"
}

volume_icon_for_level() {
    local level="$1"
    local percent

    if [[ "$level" == "Muted" ]]; then
        echo "$ICON_DIR/volume-mute.png"
        return 0
    fi

    percent="${level%%%}"
    if (( percent <= 30 )); then
        echo "$ICON_DIR/volume-low.png"
    elif (( percent <= 60 )); then
        echo "$ICON_DIR/volume-mid.png"
    else
        echo "$ICON_DIR/volume-high.png"
    fi
}

get_volume_icon() {
    local current
    current="$(get_level_label "$SINK")"
    volume_icon_for_level "$current"
}

get_mic_icon() {
    if is_muted "$SOURCE"; then
        echo "$ICON_DIR/microphone-mute.png"
    else
        echo "$ICON_DIR/microphone.png"
    fi
}

play_volume_sound() {
    if [[ -x "$SOUND_SCRIPT" ]]; then
        "$SOUND_SCRIPT" --volume >/dev/null 2>&1 || true
    fi
}

notify_volume() {
    local level
    local icon
    local percent

    level="$(get_level_label "$SINK")"
    icon="$(get_volume_icon)"

    if [[ "$level" == "Muted" ]]; then
        notify-send -e -h string:x-canonical-private-synchronous:volume_notif -u low -i "$icon" "Volume: Muted"
        return 0
    fi

    percent="${level%%%}"
    notify-send -e -h int:value:"$percent" -h string:x-canonical-private-synchronous:volume_notif -u low -i "$icon" "Volume: $level"
    play_volume_sound
}

notify_mic() {
    local level
    local icon
    local percent

    level="$(get_level_label "$SOURCE")"
    icon="$(get_mic_icon)"

    if [[ "$level" == "Muted" ]]; then
        notify-send -e -h string:x-canonical-private-synchronous:volume_notif -u low -i "$icon" "Mic-Level: Muted"
        return 0
    fi

    percent="${level%%%}"
    notify-send -e -h int:value:"$percent" -h string:x-canonical-private-synchronous:volume_notif -u low -i "$icon" "Mic-Level: $level"
}

unmute_if_needed() {
    local target="$1"
    if is_muted "$target"; then
        wpctl set-mute "$target" 0
    fi
}

inc_volume() {
    unmute_if_needed "$SINK"
    wpctl set-volume "$SINK" "${STEP}+"
    notify_volume
}

dec_volume() {
    unmute_if_needed "$SINK"
    wpctl set-volume "$SINK" "${STEP}-"
    notify_volume
}

inc_mic_volume() {
    unmute_if_needed "$SOURCE"
    wpctl set-volume "$SOURCE" "${STEP}+"
    notify_mic
}

dec_mic_volume() {
    unmute_if_needed "$SOURCE"
    wpctl set-volume "$SOURCE" "${STEP}-"
    notify_mic
}

toggle_mute() {
    if is_muted "$SINK"; then
        wpctl set-mute "$SINK" 0
        notify-send -e -u low -i "$(get_volume_icon)" "Volume Switched ON"
    else
        wpctl set-mute "$SINK" 1
        notify-send -e -u low -i "$ICON_DIR/volume-mute.png" "Volume Switched OFF"
    fi
}

toggle_mic() {
    if is_muted "$SOURCE"; then
        wpctl set-mute "$SOURCE" 0
        notify-send -e -u low -i "$ICON_DIR/microphone.png" "Microphone Switched ON"
    else
        wpctl set-mute "$SOURCE" 1
        notify-send -e -u low -i "$ICON_DIR/microphone-mute.png" "Microphone Switched OFF"
    fi
}

print_help() {
    cat <<'EOF'
Usage: volume.sh [option]

Options:
  --get            Get sink volume label
  --inc            Increase sink volume by 5%
  --dec            Decrease sink volume by 5%
  --toggle         Toggle sink mute
  --get-icon       Get sink icon path for current level
  --toggle-mic     Toggle microphone mute
  --get-mic-icon   Get microphone icon path
  --mic-inc        Increase microphone volume by 5%
  --mic-dec        Decrease microphone volume by 5%
  --help, -h       Show this help
EOF
}

# ============================================================================
# Read-Only Commands
# ============================================================================

run_query_command() {
    local action="$1"

    case "$action" in
        --get)
            get_level_label "$SINK"
            ;;
        --get-icon)
            get_volume_icon
            ;;
        --get-mic-icon)
            get_mic_icon
            ;;
        --help|-h)
            print_help
            ;;
        *)
            return 1
            ;;
    esac
}

# ============================================================================
# State-Changing Commands
# ============================================================================

run_action_command() {
    local action="$1"

    case "$action" in
        --inc)
            inc_volume
            ;;
        --dec)
            dec_volume
            ;;
        --toggle)
            toggle_mute
            ;;
        --toggle-mic)
            toggle_mic
            ;;
        --mic-inc)
            inc_mic_volume
            ;;
        --mic-dec)
            dec_mic_volume
            ;;
        *)
            return 1
            ;;
    esac
}

# ============================================================================
# Main
# ============================================================================

main() {
    local action="${1:---get}"

    check_dependencies

    if run_query_command "$action"; then
        return 0
    fi

    check_action_dependencies
    if run_action_command "$action"; then
        return 0
    fi

    get_level_label "$SINK"
}

main "$@"
