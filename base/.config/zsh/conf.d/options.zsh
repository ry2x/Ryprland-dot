# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# History
HISTFILE="$XDG_STATE_HOME/zsh/history"
HISTSIZE=50000
SAVEHIST=50000

mkdir -p -- "$XDG_STATE_HOME/zsh" "$XDG_CACHE_HOME/zsh"

setopt APPEND_HISTORY
setopt EXTENDED_HISTORY
setopt HIST_EXPIRE_DUPS_FIRST
setopt HIST_FIND_NO_DUPS
setopt HIST_IGNORE_ALL_DUPS
setopt HIST_IGNORE_SPACE
setopt HIST_REDUCE_BLANKS
setopt HIST_VERIFY
setopt SHARE_HISTORY

# General interactive behavior
setopt AUTO_CD
setopt AUTO_PUSHD
setopt INTERACTIVE_COMMENTS
setopt NO_BEEP
setopt PUSHD_IGNORE_DUPS
