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
