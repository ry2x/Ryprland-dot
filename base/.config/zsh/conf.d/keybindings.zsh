# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

bindkey -e

# Search history using the text before the cursor, like fish. These widgets
# still move through physical lines when the current edit buffer is multiline.
autoload -Uz up-line-or-beginning-search down-line-or-beginning-search
zle -N up-line-or-beginning-search
zle -N down-line-or-beginning-search

bindkey '^[[A' up-line-or-beginning-search
bindkey '^[[B' down-line-or-beginning-search
bindkey '^[OA' up-line-or-beginning-search
bindkey '^[OB' down-line-or-beginning-search

# At a secondary prompt, first bring the accepted lines back into the editable
# buffer so Backspace can remove the continuation newline as well.
function _ryprland_backward_delete_char() {
    if [[ -z "$LBUFFER" && -n "$PREBUFFER" ]]; then
        zle .push-line-or-edit
    fi

    zle .backward-delete-char
}
zle -N _ryprland_backward_delete_char

bindkey '^?' _ryprland_backward_delete_char
bindkey '^H' _ryprland_backward_delete_char

function _ryprland_cursor_shape() {
    printf '\e[5 q'
}

function _ryprland_cursor_reset() {
    printf '\e[0 q'
}

zle -N zle-line-init _ryprland_cursor_shape
zle -N zle-line-finish _ryprland_cursor_reset

bindkey -s '^O' 'yy\n'
