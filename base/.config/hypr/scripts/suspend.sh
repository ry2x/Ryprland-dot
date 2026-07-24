#!/bin/bash
# Suspend wrapper for hypridle.
# Prevents system suspension if AGS Caffeine is in Remote mode.

if [ -f /tmp/ags_caffeine_remote ]; then
    echo "Suspend prevented by AGS Caffeine (Remote mode)"
    exit 0
fi

systemctl suspend
