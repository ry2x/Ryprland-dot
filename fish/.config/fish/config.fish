#  ┏┓┳┏┓┓┏  ┏┓┏┓┳┓┏┓┳┏┓
#  ┣ ┃┗┓┣┫━━┃ ┃┃┃┃┣ ┃┃┓
#  ┻ ┻┗┛┛┗  ┗┛┗┛┛┗┻ ┻┗┛
#

### EVERYTHING IS IN conf.d folder ###

# FZF
fzf --fish | source

# ZOXIDE
zoxide init --cmd cd fish | source

# mise activation https://mise.jdx.dev/getting-started.html
if status is-interactive
    mise activate fish | source
else
    mise activate fish --shims | source
end

# Connect to Hyprland session if SSH connection is detected
if set -q SSH_CONNECTION
    set -q XDG_RUNTIME_DIR; or set -gx XDG_RUNTIME_DIR /run/user/(id -u)
    if test -d "$XDG_RUNTIME_DIR/hypr"
        set -l _real_sig (find "$XDG_RUNTIME_DIR/hypr" -maxdepth 2 -name ".socket.sock" | awk -F'/' '{print $(NF-1)}' | head -n 1)
        set -gx HYPRLAND_INSTANCE_SIGNATURE $_real_sig
    end
end
