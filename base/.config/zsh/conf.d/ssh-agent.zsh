# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# Keep forwarded or already configured agents untouched.
if [[ -z "$SSH_AUTH_SOCK" || ! -S "$SSH_AUTH_SOCK" ]]; then
    typeset _ryprland_agent_file _ryprland_agent_socket
    _ryprland_agent_file="${XDG_RUNTIME_DIR:-/run/user/$UID}/ssh-agent.zsh"
    _ryprland_agent_socket="${XDG_RUNTIME_DIR:-/run/user/$UID}/ssh-agent.sock"

    if [[ -r "$_ryprland_agent_file" ]]; then
        source "$_ryprland_agent_file" >/dev/null
    fi

    # Replace stale state with one agent shared by subsequent zsh sessions.
    if [[ -z "$SSH_AUTH_SOCK" || ! -S "$SSH_AUTH_SOCK" ]]; then
        umask 077
        rm -f -- "$_ryprland_agent_socket"
        ssh-agent -a "$_ryprland_agent_socket" -s >| "$_ryprland_agent_file"
        source "$_ryprland_agent_file" >/dev/null
    fi

    unset _ryprland_agent_file _ryprland_agent_socket
fi
