#!/bin/bash

# Update CachyOS mirrorlist using rate-mirrors.
# This script must be run as root.

set -euo pipefail

if [ "$EUID" -ne 0 ]; then
    echo "Please run as root" >&2
    exit 1
fi

echo "Updating CachyOS mirrorlist using rate-mirrors..."
rate-mirrors --allow-root --save /etc/pacman.d/cachyos-mirrorlist cachyos
echo "cachyos-mirrorlist updated successfully."

sed 's/\$arch/\$arch_v3/g' /etc/pacman.d/cachyos-mirrorlist \
    > /etc/pacman.d/cachyos-v3-mirrorlist
echo "cachyos-v3-mirrorlist updated."

sed 's/\$arch/\$arch_v4/g' /etc/pacman.d/cachyos-mirrorlist \
    > /etc/pacman.d/cachyos-v4-mirrorlist
echo "cachyos-v4-mirrorlist updated."
