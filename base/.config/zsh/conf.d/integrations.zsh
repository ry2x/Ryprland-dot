# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# Fresh, shell-independent defaults for the fzf integration.
export FZF_DEFAULT_OPTS="--height=90% --layout=reverse --border --info=inline --pointer=>"

if (( $+commands[fzf] )) && [[ -o zle ]]; then
    source <(fzf --zsh)
fi

if (( $+commands[zoxide] )); then
    eval "$(zoxide init --cmd cd zsh)"
fi

if (( $+commands[mise] )); then
    eval "$(mise activate zsh)"
fi

if (( $+commands[starship] )); then
    eval "$(starship init zsh)"
fi

# Allow SSH shells to communicate with an existing local Hyprland session.
if [[ -n "$SSH_CONNECTION" ]]; then
    export XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
    typeset -a _ryprland_hypr_sockets
    _ryprland_hypr_sockets=("$XDG_RUNTIME_DIR"/hypr/*/.socket.sock(N))

    if (( ${#_ryprland_hypr_sockets} > 0 )); then
        export HYPRLAND_INSTANCE_SIGNATURE="${_ryprland_hypr_sockets[1]:h:t}"
    fi

    unset _ryprland_hypr_sockets
fi
