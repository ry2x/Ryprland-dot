#!/usr/bin/env bash

set -euo pipefail

script_path="$(readlink -f -- "${BASH_SOURCE[0]}")"
repo_dir="$(cd "$(dirname "$script_path")/.." && pwd)"
source_dir="$repo_dir/system"

enable_remote_login=false
case "${1:-}" in
    "") ;;
    --enable-remote-login) enable_remote_login=true ;;
    *)
        printf 'Usage: %s [--enable-remote-login]\n' "$0" >&2
        exit 1
        ;;
esac
if (($# > 1)); then
    printf 'Only one installation option is accepted.\n' >&2
    exit 1
fi

if [[ "${EUID}" -ne 0 ]]; then
    printf 'Run this command as root, for example: sudo %s\n' "$script_path" >&2
    exit 1
fi

for executable in sunshine jq pipewire pipewire-pulse wireplumber pactl setpriv dbus-run-session; do
    command -v "$executable" >/dev/null || {
        printf 'Missing dependency: %s (see docs/remote-login.md)\n' "$executable" >&2
        exit 1
    }
done

getent passwd greeter >/dev/null
getent group render >/dev/null
getent group ryprland-uinput >/dev/null || groupadd --system ryprland-uinput
usermod -aG render,ryprland-uinput greeter

install -d -m 0755 \
    /etc/greetd \
    /etc/systemd/system \
    /etc/udev/rules.d \
    /usr/bin \
    /usr/share/backgrounds

install -d -o greeter -g greeter -m 0700 /var/lib/ryprland-login
install -d -o greeter -g greeter -m 0700 /var/lib/ryprland-login/credentials

# Stage the final configuration; preserve autologin until remote tests pass.
install -m 0644 "$source_dir/etc/greetd/config.toml" /etc/greetd/config.remote-login.toml
if [[ ! -e /etc/greetd/config.toml || "$enable_remote_login" == true ]]; then
    if [[ -e /etc/greetd/config.toml ]]; then
        backup=$(mktemp /etc/greetd/config.toml.backup.XXXXXX)
        cp -p /etc/greetd/config.toml "$backup"
        printf 'Saved greetd configuration to %s\n' "$backup"
    fi
    install -m 0644 "$source_dir/etc/greetd/config.toml" /etc/greetd/config.toml
else
    printf 'Kept existing greetd config (including autologin). Staged config.remote-login.toml.\n'
fi

install -m 0644 "$source_dir/etc/greetd/regreet.toml" /etc/greetd/regreet.toml
install -m 0644 "$source_dir/etc/greetd/hyprland.lua" /etc/greetd/hyprland.lua
install -m 0644 "$source_dir/etc/greetd/sunshine.conf" /etc/greetd/sunshine.conf
install -m 0644 "$source_dir/etc/greetd/sunshine-apps.json" /etc/greetd/sunshine-apps.json
install -m 0644 "$source_dir/etc/udev/rules.d/70-ryprland-login.rules" /etc/udev/rules.d/70-ryprland-login.rules
install -m 0644 "$source_dir/usr/share/backgrounds/greeter.png" /usr/share/backgrounds/greeter.png

for unit in "$source_dir"/etc/systemd/system/*; do
    install -m 0644 "$unit" "/etc/systemd/system/$(basename "$unit")"
done

for executable in "$source_dir"/usr/bin/*; do
    install -m 0755 "$executable" "/usr/bin/$(basename "$executable")"
done

systemctl daemon-reload
udevadm control --reload-rules
udevadm trigger --subsystem-match=misc --sysname-match=uinput

printf 'Installed system configuration, systemd units, and system executables.\n'
printf 'Review the files, then enable desired services manually.\n'
printf 'greetd was not restarted. Complete docs/remote-login.md before disabling autologin.\n'
