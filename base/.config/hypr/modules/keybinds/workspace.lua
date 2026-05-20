-- Keybinds for workspace management
local P = require("modules.keybinds.constants")
local mod = P.mod

local smw = hl.plugin.split_monitor_workspaces

for i = 1, 5 do
    local key = tostring(i)
    -- move to workspace
    hl.bind(mod .. " + " .. key, function() return smw.workspace(i) end,
        { description = "Switch to workspace " .. key })
    -- move focused window to workspace
    hl.bind(mod .. " + SHIFT + " .. key, function() return smw.move_to_workspace_silent(i) end,
        { description = "Move window to workspace " .. key })
end

hl.bind(mod .. " + mouse_down", function() return smw.workspace("e+1") end,
    { description = "Switch to workspace +1" })
hl.bind(mod .. " + mouse_up", function() return smw.workspace("e-1") end,
    { description = "Switch to workspace -1" })

-- game workspace
hl.bind(mod .. " + G",
    hl.dsp.exec_cmd(
        "hyprctl dispatch \"hl.dsp.focus({ monitor = \\\"DP-2\\\" })\" && hyprctl dispatch \"hl.dsp.workspace.toggle_special(\\\"game\\\")\""
    ),
    { description = "Switch to game workspace" }
)
