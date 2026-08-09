# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# Keep the main zsh configuration under XDG_CONFIG_HOME.
export ZDOTDIR="${XDG_CONFIG_HOME:-$HOME/.config}/zsh"

if [[ -r "$ZDOTDIR/.zshenv" ]]; then
    source "$ZDOTDIR/.zshenv"
fi
