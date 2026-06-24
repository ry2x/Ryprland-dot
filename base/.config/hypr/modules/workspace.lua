-- ┓ ┏┏┓┳┓┓┏┓┏┓┏┓┏┓┏┓┏┓
-- ┃┃┃┃┃┣┫┃┫ ┗┓┃┃┣┫┃ ┣
-- ┗┻┛┗┛┛┗┛┗┛┗┛┣┛┛┗┗┛┗┛

local P = require("modules.constants")
local smw = P.smw

-- Default workspace rules for per monitor
smw.setup({
    workspace_count = 5,
    monitor_priority = { "DP-2", "HDMI-A-1" },
})
