-- ┳┳┓┏┓┳┓┳┏┳┓┏┓┳┓┏┓
-- ┃┃┃┃┃┃┃┃ ┃ ┃┃┣┫┗┓
-- ┛ ┗┗┛┛┗┻ ┻ ┗┛┛┗┗┛

hl.monitor({
    output = "DP-2",
    scale = "1",
    mode = "2560x1440@100",
    position = "1920x0",
    vrr = 2,
    cm = "auto",
    sdr_eotf = "gamma22"
})

hl.monitor({
    output = "HDMI-A-1",
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
    position = "auto"
})

hl.on("monitor.added", function()
    hl.dispatch(hl.dsp.exec_cmd("ags request -i rystal-shell brightness refresh"))
end)
