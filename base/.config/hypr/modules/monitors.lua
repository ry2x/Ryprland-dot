-- ┳┳┓┏┓┳┓┳┏┳┓┏┓┳┓┏┓
-- ┃┃┃┃┃┃┃┃ ┃ ┃┃┣┫┗┓
-- ┛ ┗┗┛┛┗┻ ┻ ┗┛┛┗┗┛

local P = require("modules.constants")

hl.monitor({
    output = P.primaryMonitor,
    scale = "1",
    mode = "2560x1440@100",
    position = "1920x0",
    vrr = 2,
    cm = "auto",
    sdr_eotf = "gamma22"
})

hl.monitor({
    output = P.secondaryMonitor,
    scale = "1",
    mode = "1920x1080@60",
    position = "0x0",
    vrr = 0,
    sdr_eotf = "gamma22",
    cm = "auto"
})

hl.monitor({
    output = "RMT-1",
    mode = "1920x1080@60",
    scale = 1,
    -- Keep the remote desktop outside the physical monitors' pointer edges.
    position = "10000x10000"
})

hl.on("monitor.added", function()
    hl.dispatch(hl.dsp.exec_cmd("ags request -i rystal-shell brightness refresh"))
end)
