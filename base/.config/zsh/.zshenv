# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

# XDG base directories
export XDG_CONFIG_HOME="${XDG_CONFIG_HOME:-$HOME/.config}"
export XDG_DATA_HOME="${XDG_DATA_HOME:-$HOME/.local/share}"
export XDG_CACHE_HOME="${XDG_CACHE_HOME:-$HOME/.cache}"
export XDG_STATE_HOME="${XDG_STATE_HOME:-$HOME/.local/state}"

# Default applications
export EDITOR="nvim"
export VISUAL="$EDITOR"
export BROWSER="zen-browser"
export TERMINAL="kitty"

# Application configuration
export STARSHIP_CONFIG="$XDG_CONFIG_HOME/starship/starship.toml"
export NPM_CONFIG_USERCONFIG="$XDG_CONFIG_HOME/npm/.npmrc"
export NPM_CONFIG_CACHE="$XDG_CACHE_HOME/npm"

# Development tool storage
export CARGO_HOME="$XDG_DATA_HOME/cargo"
export RUSTUP_HOME="$XDG_DATA_HOME/rustup"
export GOPATH="$XDG_DATA_HOME/go"
export GOBIN="$GOPATH/bin"
export GOMODCACHE="$XDG_CACHE_HOME/go/mod"

# Build PATH from existing directories and remove duplicate entries.
typeset -gU path
typeset -ga _ryprland_path_prefix
_ryprland_path_prefix=()

for _ryprland_dir in \
    "$HOME/.local/bin" \
    "$HOME/.local/share/mise/shims" \
    "$CARGO_HOME/bin" \
    "$GOBIN"; do
    if [[ -d "$_ryprland_dir" ]]; then
        _ryprland_path_prefix+=("$_ryprland_dir")
    fi
done

path=("${_ryprland_path_prefix[@]}" "${path[@]}")
unset _ryprland_dir _ryprland_path_prefix
