#!/usr/bin/env bash
# ┳┳┓┏┓┏┳┓┳┳┏┓┏┓┳┓  ┳┳┓┏┓┏┓┳┏┓┓┏┓
# ┃┃┃┣┫ ┃ ┃┃┃┓┣ ┃┃  ┃┃┃┣┫┃┓┃┃ ┃┫
# ┛ ┗┛┗ ┻ ┗┛┗┛┗┛┛┗  ┛ ┗┛┗┗┛┻┗┛┛┗┛

# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

set -uo pipefail

# Directory searched by the random command for supported wallpapers.
WALLPAPER_ROOT="${RYSTAL_SHELL_WALLPAPER_DIR:-$HOME/Pictures/Wallpapers}"
# Matugen template configuration used to render application themes.
MATUGEN_CONFIG="${MATUGEN_CONFIG:-$HOME/.config/matugen/config.toml}"
# Stable image paths consumed by the Rofi themes.
ROFI_IMAGE_DIR="${ROFI_IMAGE_DIR:-$HOME/.config/rofi/images}"
# Directory containing the launcher background consumed by Rystal-shell (AGS instance).
AGS_ASSET_DIR="${RYSTAL_SHELL_CONFIG_DIR:-${XDG_CONFIG_HOME:-$HOME/.config}/rystal-shell}/assets"
AGS_INSTANCE="${RYSTAL_SHELL_INSTANCE:-rystal-shell}"
# Stable symlink to the currently selected source wallpaper.
BACKGROUND_LINK="$HOME/.local/share/bg"
# Shared directory roots.
RYSTAL_CACHE_ROOT="${RYSTAL_SHELL_CACHE_DIR:-${XDG_CACHE_HOME:-$HOME/.cache}/rystal-shell}"
RYSTAL_STATE_ROOT="${RYSTAL_SHELL_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/rystal-shell}"
if [[ -n "${RYSTAL_SHELL_RUNTIME_DIR:-}" ]]; then
    RYSTAL_RUNTIME_ROOT="$RYSTAL_SHELL_RUNTIME_DIR"
elif [[ -n "${XDG_RUNTIME_DIR:-}" ]]; then
    RYSTAL_RUNTIME_ROOT="$XDG_RUNTIME_DIR/rystal-shell"
else
    RYSTAL_RUNTIME_ROOT="/tmp/rystal-shell-$UID"
fi
# Persistent state and timing-log directory.
STATE_ROOT="$RYSTAL_STATE_ROOT/theme"
# Root directory for wallpaper-derived image caches.
CACHE_ROOT="$RYSTAL_CACHE_ROOT/wallpapers"
# Per-session directory used for request coordination and locking.
RUNTIME_ROOT="$RYSTAL_RUNTIME_ROOT/theme"
# Latest queued theme request shared by concurrent invocations.
REQUEST_FILE="$RUNTIME_ROOT/request"
# Identifier of the most recently completed request.
PROCESSED_FILE="$RUNTIME_ROOT/processed"
# Advisory lock that serializes Matugen and asset generation.
LOCK_FILE="$RUNTIME_ROOT/lock"
# Persistent record of the current wallpaper path.
CURRENT_FILE="$STATE_ROOT/current-wallpaper"
# Append-only timing and stale-request log.
LOG_FILE="$STATE_ROOT/history.log"
# Maximum number of wallpaper asset caches retained by LRU pruning.
MAX_CACHE_ENTRIES=128

usage() {
    cat <<'EOF'
Usage:
  theme-switch.sh [--dark|--light] set FILE
  theme-switch.sh [--dark|--light] random
  theme-switch.sh [--dark|--light] refresh
EOF
}

notify() {
    local urgency="$1"
    local title="$2"
    local body="$3"
    local icon="${4:-}"
    local args=(-e -h string:x-canonical-private-synchronous:matugen_notif -u "$urgency" -a "Rystal Shell")

    command -v notify-send >/dev/null 2>&1 || return 0
    [[ -n "$icon" && -f "$icon" ]] && args+=(-n "$icon")
    notify-send "${args[@]}" "$title" "$body"
}

die() {
    notify critical "Theme Switch Error" "$1"
    printf 'theme-switch: %s\n' "$1" >&2
    exit 1
}

require_command() {
    command -v "$1" >/dev/null 2>&1 || die "Required command not found: $1"
}

atomic_write() {
    local destination="$1"
    local value="$2"
    local temporary="${destination}.tmp.$$"

    printf '%s\n' "$value" >"$temporary" && mv -f "$temporary" "$destination"
}

atomic_link() {
    local target="$1"
    local destination="$2"
    local temporary="${destination}.tmp.$$"

    ln -sfn "$target" "$temporary" && mv -Tf "$temporary" "$destination"
}

is_supported_wallpaper() {
    case "${1,,}" in
    *.jpg | *.jpeg | *.png | *.webp | *.gif) return 0 ;;
    *) return 1 ;;
    esac
}

choose_random_wallpaper() {
    local -a wallpapers=()
    mapfile -d '' wallpapers < <(
        find "$WALLPAPER_ROOT" -type f \
            \( -iname '*.jpg' -o -iname '*.jpeg' -o -iname '*.png' -o -iname '*.webp' -o -iname '*.gif' \) \
            -print0
    )
    ((${#wallpapers[@]} > 0)) || die "No wallpapers found in $WALLPAPER_ROOT"
    printf '%s\n' "${wallpapers[RANDOM % ${#wallpapers[@]}]}"
}

generate_assets() {
    local wallpaper="$1"
    local cache_dir="$2"
    local temporary

    if [[ -f "$cache_dir/.complete" ]]; then
        touch "$cache_dir"
        return 0
    fi

    if [[ -d "$cache_dir" && "$cache_dir" == "$CACHE_ROOT"/* ]]; then
        find "$cache_dir" -mindepth 1 -delete
        rmdir "$cache_dir" 2>/dev/null || return 1
    fi

    temporary=$(mktemp -d "$CACHE_ROOT/.build.XXXXXX") || return 1
    if ! magick "${wallpaper}[0]" -strip \
        \( -clone 0 -thumbnail 1000x1000^ -gravity center -extent 1000 -quality 70 \
        -write "$temporary/currentWal.thumb" +delete \) \
        \( -clone 0 -thumbnail 500x500^ -gravity center -extent 500x500 \
        -write "$temporary/currentWal.sqre" \
        \( +clone -fill white -colorize 100 \
        -fill 'gray(30%)' -draw 'polygon 400,500 500,500 500,0 450,0' \
        -fill black -draw 'polygon 500,500 500,0 450,500' \) \
        -alpha off -compose CopyOpacity -composite \
        -write "png:$temporary/currentWalQuad.quad" +delete \) \
        null:; then
        find "$temporary" -mindepth 1 -delete 2>/dev/null
        rmdir "$temporary" 2>/dev/null
        return 1
    fi

    : >"$temporary/.complete"
    if ! mv "$temporary" "$cache_dir"; then
        find "$temporary" -mindepth 1 -delete 2>/dev/null
        rmdir "$temporary" 2>/dev/null
        return 1
    fi
}

publish_assets() {
    local cache_dir="$1"
    local wallpaper="$2"
    local name

    mkdir -p "$ROFI_IMAGE_DIR" "$AGS_ASSET_DIR" "$(dirname "$BACKGROUND_LINK")"
    for name in currentWal.thumb currentWal.sqre currentWalQuad.quad; do
        atomic_link "$cache_dir/$name" "$ROFI_IMAGE_DIR/$name" || return 1
    done
    # Remove the legacy blur alias now that no Rofi theme consumes it.
    rm -f "$ROFI_IMAGE_DIR/currentWalBlur.thumb"

    cp "$cache_dir/currentWalQuad.quad" "$AGS_ASSET_DIR/.launcher_bg.png.tmp.$$" || return 1
    mv -f "$AGS_ASSET_DIR/.launcher_bg.png.tmp.$$" "$AGS_ASSET_DIR/launcher_bg.png" || return 1
    atomic_link "$wallpaper" "$BACKGROUND_LINK"
}

prune_cache() {
    local -a entries=()
    local entry path index

    mapfile -d '' entries < <(
        find "$CACHE_ROOT" -mindepth 1 -maxdepth 1 -type d -name '[[:xdigit:]]*' -printf '%T@ %p\0' |
            sort -zrn
    )
    for ((index = MAX_CACHE_ENTRIES; index < ${#entries[@]}; index++)); do
        entry="${entries[index]}"
        path="${entry#* }"
        [[ "$path" == "$CACHE_ROOT"/* ]] || continue
        find "$path" -mindepth 1 -delete
        rmdir "$path" 2>/dev/null || true
    done
}

mode=dark
command_name=""
wallpaper_arg=""

while (($# > 0)); do
    case "$1" in
    --dark | --light) mode="${1#--}" ;;
    set | random | refresh)
        [[ -z "$command_name" ]] || die "Only one command may be specified"
        command_name="$1"
        ;;
    -h | --help)
        usage
        exit 0
        ;;
    --)
        shift
        (($# == 1)) || die "-- must be followed by exactly one wallpaper path"
        wallpaper_arg="$1"
        shift
        break
        ;;
    -*) die "Unknown option: $1" ;;
    *)
        [[ -z "$wallpaper_arg" ]] || die "Unexpected argument: $1"
        wallpaper_arg="$1"
        ;;
    esac
    shift
done

[[ -n "$command_name" ]] || {
    usage >&2
    exit 2
}

mkdir -p "$STATE_ROOT" "$CACHE_ROOT" "$RUNTIME_ROOT"
require_command awww
require_command flock
require_command magick
require_command matugen
require_command sha256sum

case "$command_name" in
set)
    [[ -n "$wallpaper_arg" ]] || die "set requires a wallpaper path"
    wallpaper_path=$(readlink -f -- "$wallpaper_arg") || die "Cannot resolve wallpaper: $wallpaper_arg"
    ;;
random)
    [[ -z "$wallpaper_arg" ]] || die "random does not accept a wallpaper path"
    wallpaper_path=$(choose_random_wallpaper)
    ;;
refresh)
    [[ -z "$wallpaper_arg" ]] || die "refresh does not accept a wallpaper path"
    if [[ -s "$CURRENT_FILE" ]]; then
        IFS= read -r wallpaper_path <"$CURRENT_FILE"
    elif [[ -L "$BACKGROUND_LINK" ]]; then
        wallpaper_path=$(readlink -f -- "$BACKGROUND_LINK") || die "Cannot resolve the current wallpaper link"
        atomic_write "$CURRENT_FILE" "$wallpaper_path" || die "Failed to migrate the current wallpaper state"
    else
        die "No current wallpaper has been recorded"
    fi
    ;;
esac

[[ -f "$wallpaper_path" ]] || die "Wallpaper does not exist: $wallpaper_path"
is_supported_wallpaper "$wallpaper_path" || die "Unsupported wallpaper format: $wallpaper_path"
[[ "$wallpaper_path" != *$'\n'* && "$wallpaper_path" != *$'\t'* ]] || die "Tabs and newlines are not supported in wallpaper paths"

if [[ "$command_name" != refresh ]]; then
    awww img --resize crop --transition-type random --transition-duration 2 \
        --transition-fps 60 --transition-step 5 "$wallpaper_path" || die "awww failed to set the wallpaper"
    atomic_write "$CURRENT_FILE" "$wallpaper_path" || die "Failed to save the current wallpaper"
fi

request_id="$(date +%s%N)-$$-$RANDOM"
request_value="$request_id"$'\t'"$mode"$'\t'"$wallpaper_path"
atomic_write "$REQUEST_FILE" "$request_value" || die "Failed to queue the theme request"

exec 9>"$LOCK_FILE"
flock 9

IFS=$'\t' read -r active_id mode wallpaper_path <"$REQUEST_FILE"
if [[ -s "$PROCESSED_FILE" ]] && [[ "$(<"$PROCESSED_FILE")" == "$active_id" ]]; then
    exit 0
fi

start_seconds=$SECONDS
file_signature=$(stat -Lc '%s:%y' "$wallpaper_path") || die "Failed to inspect wallpaper: $wallpaper_path"
cache_key=$(printf '%s\0%s' "$wallpaper_path" "$file_signature" | sha256sum | cut -d' ' -f1)
cache_dir="$CACHE_ROOT/$cache_key"

prefer=darkness
[[ "$mode" == light ]] && prefer=lightness
matugen image "$wallpaper_path" -m "$mode" -c "$MATUGEN_CONFIG" --prefer "$prefer" &
matugen_pid=$!
generate_assets "$wallpaper_path" "$cache_dir" &
assets_pid=$!

matugen_ok=true
assets_ok=true
wait "$matugen_pid" || matugen_ok=false
wait "$assets_pid" || assets_ok=false

$matugen_ok || die "Matugen failed for: $wallpaper_path"
$assets_ok || die "Image asset generation failed for: $wallpaper_path"

IFS=$'\t' read -r latest_id _ _ <"$REQUEST_FILE"
if [[ "$latest_id" != "$active_id" ]]; then
    printf '%s stale %s\n' "$(date --iso-8601=seconds)" "$wallpaper_path" >>"$LOG_FILE"
    exit 0
fi

publish_assets "$cache_dir" "$wallpaper_path" || die "Failed to publish generated image assets"

pkill -USR1 -u "$USER" -x kitty 2>/dev/null || true
if command -v ags >/dev/null 2>&1 && ags list | grep -Fxq "$AGS_INSTANCE"; then
    ags request -i "$AGS_INSTANCE" reload-css >/dev/null || die "AGS failed to reload its stylesheet"
fi
command -v bat >/dev/null 2>&1 && bat cache --build >/dev/null 2>&1 &

atomic_write "$PROCESSED_FILE" "$active_id"
touch "$cache_dir"
prune_cache

elapsed=$((SECONDS - start_seconds))
printf '%s success mode=%s seconds=%s wallpaper=%q\n' \
    "$(date --iso-8601=seconds)" "$mode" "$elapsed" "$wallpaper_path" >>"$LOG_FILE"
notify normal "Theme Switch Complete" "Wallpaper: ${wallpaper_path##*/}" "$cache_dir/currentWal.sqre"
