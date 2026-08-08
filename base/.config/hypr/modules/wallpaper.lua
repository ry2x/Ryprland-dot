-- ┓ ┏┏┓┓ ┓ ┏┓┏┓┏┓┏┓┳┓
-- ┃┃┃┣┫┃ ┃ ┃┃┣┫┃┃┣ ┣┫
-- ┗┻┛┛┗┗┛┗┛┣┛┛┗┣┛┗┛┛┗

local M = {}

M.timer = hl.timer(
    function()
        hl.dispatch(hl.dsp.exec_cmd("theme-switch.sh random"))
    end,
    {
        timeout = 360000,
        type = "repeat"
    }
)

return M
