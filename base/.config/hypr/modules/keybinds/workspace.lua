-- Keybinds for workspace management
local P = require("modules.keybinds.constants")
local mod = P.mod

package.path = package.path .. ";./?.lua;./?/init.lua"
local smw = require("plugins.split-monitor-workspaces")

for i = 1, 5 do
    local key = tostring(i)
    -- move to workspace
    hl.bind(mod .. " + " .. key, smw.workspace(key),
        { description = "Switch to workspace " .. key })
    -- move focused window to workspace
    hl.bind(mod .. " + SHIFT + " .. key, smw.move_to_workspace_silent(key),
        { description = "Move window to workspace " .. key })
end

-- game workspace
hl.bind(mod .. " + G",
    function()
        hl.dispatch(hl.dsp.focus({ monitor = "DP-2" }))
        hl.dispatch(hl.dsp.workspace.toggle_special("game"))
    end,
    { description = "Switch to game workspace" }
)

hl.bind(mod .. " + SHIFT + TAB", function()
    if hl.plugin and hl.plugin.scrolloverview then
        hl.plugin.scrolloverview.overview("toggle")
    end
end)
