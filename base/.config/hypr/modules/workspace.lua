-- ┓ ┏┏┓┳┓┓┏┓┏┓┏┓┏┓┏┓┏┓
-- ┃┃┃┃┃┣┫┃┫ ┗┓┃┃┣┫┃ ┣
-- ┗┻┛┗┛┛┗┛┗┛┗┛┣┛┛┗┗┛┗┛

-- Default workspace rules for per monitor
local smw = hl.plugin.split_monitor_workspaces
smw.monitor_priority({ "DP-2", "HDMI-A-1" })

smw.max_workspaces({ monitor = "DP-2", max = 5 })
smw.max_workspaces({ monitor = "HDMI-A-1", max = 5 })
