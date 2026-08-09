# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# This file is loaded only by interactive shells.
[[ -o interactive ]] || return

source "$ZDOTDIR/conf.d/options.zsh"
source "$ZDOTDIR/conf.d/completion.zsh"
source "$ZDOTDIR/conf.d/aliases.zsh"
source "$ZDOTDIR/functions/yy.zsh"
source "$ZDOTDIR/conf.d/ssh-agent.zsh"
source "$ZDOTDIR/conf.d/integrations.zsh"
source "$ZDOTDIR/conf.d/keybindings.zsh"

# Package-managed plugins. Syntax highlighting must be loaded last.
source /usr/share/zsh/plugins/zsh-autosuggestions/zsh-autosuggestions.zsh
source /usr/share/zsh/plugins/zsh-syntax-highlighting/zsh-syntax-highlighting.zsh

fastfetch
