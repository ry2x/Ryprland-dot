# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# File listing
alias ls='eza --icons --color=always --group-directories-first'
alias l='eza -lh --icons --color=always'
alias la='eza -a --icons --color=always'
alias ll='eza -lga --icons --color=always'
alias lsd='eza -d */ --icons --color=always'
alias lt='eza --tree --icons --color=always'
alias l1='eza -1 --icons --color=always'

# Editing and navigation
alias v='nvim'
alias e='nvim'
alias ..='cd ..'
alias ...='cd ../..'
alias ....='cd ../../..'
alias c='clear'
alias q='exit'
alias reload='exec zsh'

# Utilities
alias grep='grep --color=auto'
alias wget='wget -c'
alias icat='kitten icat'

# Git
alias g='git'
alias ga='git add'
alias gs='git status'
alias gd='git diff'
alias gc='git commit'
alias gcl='git clone'
alias gp='git push'
alias gl='git pull'
alias gb='git branch'
alias gco='git checkout'
