#!/usr/bin/env bash

set -euo pipefail

script_path="$(readlink -f -- "${BASH_SOURCE[0]}")"
repo_dir="$(cd "$(dirname "$script_path")/.." && pwd)"
source_dir="$repo_dir/system"

if [[ "${EUID}" -ne 0 ]]; then
    printf 'Run this command as root, for example: sudo %s\n' "$script_path" >&2
    exit 1
fi

install -d -m 0755 \
    /etc/greetd \
    /etc/systemd/system \
    /usr/bin \
    /usr/share/backgrounds

install -m 0644 "$source_dir/etc/greetd/config.toml" /etc/greetd/config.toml
install -m 0644 "$source_dir/etc/greetd/regreet.toml" /etc/greetd/regreet.toml
install -m 0644 "$source_dir/etc/greetd/hyprland.lua" /etc/greetd/hyprland.lua
install -m 0644 "$source_dir/usr/share/backgrounds/greeter.png" /usr/share/backgrounds/greeter.png

for unit in "$source_dir"/etc/systemd/system/*; do
    install -m 0644 "$unit" "/etc/systemd/system/$(basename "$unit")"
done

for executable in "$source_dir"/usr/bin/*; do
    install -m 0755 "$executable" "/usr/bin/$(basename "$executable")"
done

systemctl daemon-reload

printf 'Installed system configuration, systemd units, and system executables.\n'
printf 'Review the files, then enable desired services manually.\n'
