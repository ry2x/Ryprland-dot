-- ┓ ┏┏┓┓ ┓ ┏┓┏┓┏┓┏┓┳┓
-- ┃┃┃┣┫┃ ┃ ┃┃┣┫┃┃┣ ┣┫
-- ┗┻┛┛┗┗┛┗┛┣┛┛┗┣┛┗┛┛┗

local M = {}

M.timer = hl.timer(
    function()
        hl.dispatch(hl.dsp.exec_cmd("waypaper --random"))
    end,
    {
        timeout = 360000,
        type = "repeat"
    }
)

return M
