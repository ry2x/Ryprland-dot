-- Keybinds for window management
local P = require("modules.keybinds.constants")
local mod = P.mod

-- drag window
hl.bind(mod .. " + mouse:272", hl.dsp.window.drag(), { mouse = true, description = "Drag window" })

-- resize window
hl.bind(mod .. " + mouse:273", hl.dsp.window.resize(), { mouse = true, description = "Resize window" })

for i = 1, 4 do
    local keys = { "Left", "Right", "Up", "Down" }
    local directions = { "l", "r", "u", "d" }

    -- move window
    hl.bind(mod .. " + SHIFT + " .. keys[i], hl.dsp.window.move({ direction = directions[i] }),
        { description = "Move window " .. keys[i] })

    -- move focus
    hl.bind(mod .. " + " .. keys[i], hl.dsp.focus({ direction = directions[i] }),
        { description = "Move focus " .. keys[i] })
end

-- kill window
hl.bind(mod .. "+ C", hl.dsp.window.close(), { description = "Kill window" })

-- kill all windows
hl.bind(mod .. "+ SHIFT + C", hl.dsp.exec_cmd(P.hyprScript .. "/killActiveProcess.sh"),
    { description = "Kill all windows" })

hl.bind(mod .. "+ F", hl.dsp.window.fullscreen({ action = "toggle" }), { description = "Toggle fullscreen" })

hl.bind(mod .. "+ SHIFT +F", hl.dsp.window.float(), { description = "Toggle floating" })

hl.bind("ALT + TAB", hl.dsp.window.cycle_next(), { description = "Cycle windows" })
