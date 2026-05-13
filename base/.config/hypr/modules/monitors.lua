-- ┳┳┓┏┓┳┓┳┏┳┓┏┓┳┓┏┓
-- ┃┃┃┃┃┃┃┃ ┃ ┃┃┣┫┗┓
-- ┛ ┗┗┛┛┗┻ ┻ ┗┛┛┗┗┛

hl.monitor({
    output = "DP-2",
    scale = "1",
    mode = "2560x1440@100",
    position = "1920x0",
    cm = "auto",
    vrr = 2
})

hl.monitor({
    output = "HDMI-A-1",
    scale = "1",
    mode = "1920x1080@60",
    position = "0x0",
    vrr = 0
})

-- Default workspace rules for per monitor
local smw = hl.plugin.split_monitor_workspaces
smw.monitor_priority({ "DP-2", "HDMI-A-1" })

smw.max_workspaces({ monitor = "DP-2", max = 5 })
smw.max_workspaces({ monitor = "HDMI-A-1", max = 5 })
