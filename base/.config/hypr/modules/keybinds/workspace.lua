-- Keybinds for workspace management
local P = require("modules.constants")
local mod = P.mod
local smw = P.smw

for i = 1, 5 do
    local key = tostring(i)
    -- move to workspace
    hl.bind(mod .. " + " .. key, smw.workspace(key),
        { description = "Switch to workspace " .. key })
    -- move focused window to workspace
    hl.bind(mod .. " + SHIFT + " .. key, smw.move_to_workspace_silent(key),
        { description = "Move window to workspace " .. key })
end

-- toggle workspace overview
hl.bind(mod .. " + SHIFT + TAB",
    function()
        if hl.plugin and hl.plugin.scrolloverview then
            hl.plugin.scrolloverview.overview("toggle")
        end
    end,
    { description = "Toggle workspace overview" }
)
