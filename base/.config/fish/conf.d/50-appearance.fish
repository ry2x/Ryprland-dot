#  ┏┓┏┓  ┏┓┏┓┏┓┏┓┏┓┳┓┏┓┳┓┏┓┏┓
#  ┣┓┃┫━━┣┫┃┃┃┃┣ ┣┫┣┫┣┫┃┃┃ ┣
#  ┗┛┗┛  ┛┗┣┛┣┛┗┛┛┗┛┗┛┗┛┗┗┛┗┛
#

# Autocomplete and highlight colors
set -g fish_color_normal brwhite
set -g fish_color_autosuggestion brblack
set -g fish_color_command brgreen
set -g fish_color_error brred
set -g fish_color_param brwhite2

# Prompt (Starship)
starship init fish | source
