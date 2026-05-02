#!/usr/bin/env bash
#  ┳┓┏┓┏┓┓┏┳┓┏┓
#  ┣┫┣┫┗┓┣┫┣┫┃
#  ┻┛┛┗┗┛┛┗┛┗┗┛
#

# -----------------------------------------------------
# Load modular configarion
# -----------------------------------------------------

for f in ~/.config/bashrc/*; do
    if [ ! -d "$f" ]; then
        c=$(echo "$f" | sed -e "s=\.config/bashrc=\.config/bashrc/custom=")
        if [[ -f "$c" ]]; then
            source "$c"
        else
            source "$f"
        fi
    fi
done

# -----------------------------------------------------
# Load single customization file (if exists)
# -----------------------------------------------------

if [ -f ~/.bashrc_custom ]; then
    source ~/.bashrc_custom
fi

#THIS MUST BE AT THE END OF THE FILE FOR SDKMAN TO WORK!!!
export SDKMAN_DIR="$HOME/.sdkman"
[[ -s "$HOME/.sdkman/bin/sdkman-init.sh" ]] && source "$HOME/.sdkman/bin/sdkman-init.sh"

# Connect to Hyprland session if SSH connection is detected
if [ -n "$SSH_CONNECTION" ]; then
    XDG_RUNTIME_DIR="${XDG_RUNTIME_DIR:-/run/user/$(id -u)}"
    export XDG_RUNTIME_DIR
    if [ -d "$XDG_RUNTIME_DIR/hypr" ]; then
        REAL_SIG=$(find "$XDG_RUNTIME_DIR/hypr" -maxdepth 2 -name ".socket.sock" | awk -F'/' '{print $(NF-1)}' | head -n 1)
        export HYPRLAND_INSTANCE_SIGNATURE="$REAL_SIG"
        unset REAL_SIG
    fi
fi
