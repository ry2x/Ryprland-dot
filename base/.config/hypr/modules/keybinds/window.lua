-- Keybinds for window management
local P = require("modules.keybinds.constants")
local mod = P.mod

local F = require("modules.keybinds.utils")
local sendNotification = F.sendNotification

-- drag window
hl.bind(mod .. "+ mouse:272", hl.dsp.window.drag(), { mouse = true, description = "Drag window" })

-- resize window
hl.bind(mod .. "+ mouse:273", hl.dsp.window.resize(), { mouse = true, description = "Resize window" })

-- move and focus windows
for i = 1, 4 do
    local keys = { "Left", "Right", "Up", "Down" }
    local directions = { "l", "r", "u", "d" }

    -- move window
    hl.bind(mod .. "+ SHIFT + " .. keys[i], hl.dsp.window.move({ direction = directions[i] }),
        { description = "Move window " .. keys[i] })

    -- move focus
    hl.bind(mod .. "+ " .. keys[i], hl.dsp.focus({ direction = directions[i] }),
        { description = "Move focus " .. keys[i] })
end

hl.bind(mod .. " + mouse_down", hl.dsp.focus({ direction = "left" }),
    { description = "Switch to workspace +1" })
hl.bind(mod .. " + mouse_up", hl.dsp.focus({ direction = "right" }),
    { description = "Switch to workspace -1" })

-- swap columns
hl.bind(mod .. "+ CAPS + Left", hl.dsp.window.swap({ direction = "l" }), { description = "Swap column left" })
hl.bind(mod .. "+ CAPS + Right", hl.dsp.window.swap({ direction = "r" }), { description = "Swap column right" })

-- cycle windows
hl.bind(mod .. "+ TAB", hl.dsp.window.cycle_next(), { description = "Cycle windows" })

-- change col size
hl.bind(mod .. "+ CAPS + TAB",
    function()
        local big = 0.95
        local small = 0.5
        if tonumber(hl.get_config("scrolling.column_width")) - 0.7 > 0 then
            hl.dispatch(hl.dsp.layout("colresize all " .. small))
            hl.config({ scrolling = { column_width = small } })
            sendNotification(P.icon .. "/col_resize_small.png", "Column Size: Small", "")
        else
            hl.dispatch(hl.dsp.layout("colresize all " .. big))
            hl.config({ scrolling = { column_width = big } })
            sendNotification(P.icon .. "/col_resize_big.png", "Column Size: Big", "")
        end
    end,
    { description = "Change column size(0.5/0.95)" }
)

-- kill windowd
hl.bind(mod .. "+ C", hl.dsp.window.close(), { description = "Kill window" })

-- kill all windows
hl.bind(mod .. "+ SHIFT + C", hl.dsp.exec_cmd(P.hyprScript .. "/killActiveProcess.sh"),
    { description = "Kill all windows" })

-- toggle floating and fullscreen
hl.bind(mod .. "+ F", hl.dsp.window.fullscreen({ action = "toggle" }), { description = "Toggle fullscreen" })
hl.bind(mod .. "+ SHIFT +F", hl.dsp.window.float(), { description = "Toggle floating" })
