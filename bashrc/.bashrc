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
