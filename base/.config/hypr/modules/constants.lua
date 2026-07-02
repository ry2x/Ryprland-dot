-- ┏┓┏┓┳┓┏┓┏┳┓┏┓┳┓┏┳┓┏┓
-- ┃ ┃┃┃┃┗┓ ┃ ┣┫┃┃ ┃ ┗┓
-- ┗┛┗┛┛┗┗┛ ┻ ┛┗┛┗ ┻ ┗┛

package.path = package.path .. ";./?.lua;./?/init.lua"
local smw = require("plugins.split-monitor-workspaces")

local M = {}

M.hyprScript = "$HOME/.config/hypr/scripts"
M.rofiScript = "$HOME/.config/rofi/scripts"
M.icon = "$HOME/.config/hypr/icons"

M.terminal = "kitty"
M.terminal_tmp = "kitty --title TempTerminal"
M.terminal_dev = "kitty --config $HOME/.config/kitty/dev.conf"
M.browser = "zen-browser"
M.fileManager = "thunar"
M.updater = "kitty --title PacUpdate par_tui"
M.electronOptions = "--enable-wayland-ime --enable-features=UseOzonePlatform --ozone-platform=wayland --disable-gpu"

M.mod = "SUPER"

M.smw = smw

return M
