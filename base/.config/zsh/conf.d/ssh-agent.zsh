# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# Keep forwarded or already configured agents untouched. GCR discovers keys
# lazily, so opening a terminal never prompts for a key passphrase.
if [[ -z "$SSH_AUTH_SOCK" || ! -S "$SSH_AUTH_SOCK" ]]; then
    typeset _ryprland_agent_socket
    _ryprland_agent_socket="${XDG_RUNTIME_DIR:-/run/user/$UID}/gcr/ssh"

    if [[ ! -S "$_ryprland_agent_socket" ]]; then
        systemctl --user start gcr-ssh-agent.socket &>/dev/null
    fi

    if [[ -S "$_ryprland_agent_socket" ]]; then
        export SSH_AUTH_SOCK="$_ryprland_agent_socket"
    else
        unset SSH_AUTH_SOCK
    fi

    unset _ryprland_agent_socket
fi
