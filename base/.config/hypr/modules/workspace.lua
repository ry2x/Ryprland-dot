-- ┓ ┏┏┓┳┓┓┏┓┏┓┏┓┏┓┏┓┏┓
-- ┃┃┃┃┃┣┫┃┫ ┗┓┃┃┣┫┃ ┣
-- ┗┻┛┗┛┛┗┛┗┛┗┛┣┛┛┗┗┛┗┛

-- Default workspace rules for per monitor
package.path = package.path .. ";./?.lua;./?/init.lua"
local smw = require("plugins.split-monitor-workspaces")

smw.setup({
    workspace_count = 5,
    monitor_priority = { "DP-2", "HDMI-A-1" },
})
