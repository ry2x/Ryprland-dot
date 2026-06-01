-- Keybinds for window management
local P = require("modules.keybinds.constants")
local mod = P.mod

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

-- swap columns
hl.bind(mod .. "+ CAPS + Left", hl.dsp.window.swap({ direction = "l" }), { description = "Swap column left" })
hl.bind(mod .. "+ CAPS + Right", hl.dsp.window.swap({ direction = "r" }), { description = "Swap column right" })

-- cycle windows
hl.bind(mod .. "+ TAB", hl.dsp.window.cycle_next(), { description = "Cycle windows" })

-- change col size
hl.bind(mod .. "+ CAPS + TAB", function()
    local col_size = hl.get_config("scrolling.column_width")
    local size = tonumber(col_size) - 0.7
    if size > 0 then
        hl.dsp.layout("colresize all 0.5")
        hl.dispatch(hl.dsp.layout("colresize all 0.5"))
        hl.config({ scrolling = { column_width = 0.5 } })
    else
        hl.dispatch(hl.dsp.layout("colresize all 0.95"))
        hl.config({ scrolling = { column_width = 0.95 } })
    end
end, { description = "Change column size(0.5/0.95)" })

-- kill windowd
hl.bind(mod .. "+ C", hl.dsp.window.close(), { description = "Kill window" })

-- kill all windows
hl.bind(mod .. "+ SHIFT + C", hl.dsp.exec_cmd(P.hyprScript .. "/killActiveProcess.sh"),
    { description = "Kill all windows" })

-- toggle floating and fullscreen
hl.bind(mod .. "+ F", hl.dsp.window.fullscreen({ action = "toggle" }), { description = "Toggle fullscreen" })
hl.bind(mod .. "+ SHIFT +F", hl.dsp.window.float(), { description = "Toggle floating" })
