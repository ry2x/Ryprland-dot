#!/bin/bash

# Update CachyOS mirrorlist using rate-mirrors
# This script must be run as root

if [ "$EUID" -ne 0 ]; then
    echo "Please run as root"
    exit 1
fi

echo "Updating cachyos mirrorlist using rate-mirrors..."

# Run rate-mirrors and save to the main mirrorlist
# Note: global options like --allow-root and --save must come before the subcommand (cachyos)
rate-mirrors --allow-root --save /etc/pacman.d/cachyos-mirrorlist cachyos

if [ $? -eq 0 ]; then
    echo "cachyos-mirrorlist updated successfully."

    sed 's/\$arch/\$arch_v3/g' /etc/pacman.d/cachyos-mirrorlist > /etc/pacman.d/cachyos-v3-mirrorlist
    echo "cachyos-v3-mirrorlist updated."

    sed 's/\$arch/\$arch_v4/g' /etc/pacman.d/cachyos-mirrorlist > /etc/pacman.d/cachyos-v4-mirrorlist
    echo "cachyos-v4-mirrorlist updated."
else
    echo "Failed to update cachyos mirrorlist."
    exit 1
fi
