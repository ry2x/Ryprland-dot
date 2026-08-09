# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

bindkey -v
export KEYTIMEOUT=1

function _ryprland_cursor_shape() {
    case "$KEYMAP" in
        vicmd | visual)
            printf '\e[1 q'
            ;;
        viopp)
            printf '\e[3 q'
            ;;
        *)
            printf '\e[5 q'
            ;;
    esac
}

function _ryprland_cursor_reset() {
    printf '\e[0 q'
}

zle -N zle-keymap-select _ryprland_cursor_shape
zle -N zle-line-init _ryprland_cursor_shape
zle -N zle-line-finish _ryprland_cursor_reset

bindkey -M viins -s '^O' 'yy\n'
bindkey -M vicmd -s '^O' 'yy\n'
bindkey -M visual -s '^O' 'yy\n'
