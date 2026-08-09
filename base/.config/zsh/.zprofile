# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# Start the graphical session only from the first virtual terminal.
if [[ -z "$DISPLAY" && -z "$WAYLAND_DISPLAY" && "$TTY" == "/dev/tty1" ]] &&
    (( $+commands[start-hyprland] )); then
    exec start-hyprland
fi
