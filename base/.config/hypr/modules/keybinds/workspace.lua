-- Keybinds for workspace management
local P = require("modules.constants")
local mod = P.mod
local smw = P.smw

local F = require("modules.utils")
local sendNotification = F.sendNotification

for i = 1, 5 do
    local key = tostring(i)
    -- move to workspace
    hl.bind(mod .. " + " .. key, smw.workspace(key),
        { description = "Switch to workspace " .. key })
    -- move focused window to workspace
    hl.bind(mod .. " + SHIFT + " .. key, smw.move_to_workspace_silent(key),
        { description = "Move window to workspace " .. key })
end

hl.bind(mod .. "+ CAPS + Up", smw.workspace("-1"), { description = "Switch to -1 workspace" })
hl.bind(mod .. "+ CAPS + Down", smw.workspace("+1"), { description = "Switch to +1 workspace" })

-- toggle workspace overview
hl.bind(mod .. " + SHIFT + TAB",
    function()
        if hl.plugin and hl.plugin.scrolloverview then
            hl.plugin.scrolloverview.overview("toggle")
        end
    end,
    { description = "Toggle workspace overview" }
)

-- change col size
local col_state_tb = {}
local BIG = 0.95
local SMALL = 0.5

local function isExistingInTb(ws)
    if col_state_tb[ws] ~= nil then
        return true
    else
        return false
    end
end

local function setColSizeTb(ws, size, size_str)
    col_state_tb[ws] = size
    hl.dispatch(hl.dsp.layout("colresize all " .. size))
    hl.config({ scrolling = { column_width = size } })
    sendNotification(P.icon .. "/col_resize_" .. size_str .. ".png", "Column Size: " .. size_str, "")
end

hl.bind(mod .. "+ CAPS + TAB",
    function()
        local current_ws = hl.get_active_workspace()
        if not current_ws then
            return
        end
        local ws = current_ws.id

        if not isExistingInTb(ws) then
            setColSizeTb(ws, SMALL, "small")
            return
        end

        if col_state_tb[ws] - 0.7 > 0 then
            setColSizeTb(ws, SMALL, "small")
        else
            setColSizeTb(ws, BIG, "big")
        end
    end,
    { description = "Change column size(0.5/0.95)" }
)

-- keep col size per workspace
hl.on("workspace.active",
    function(current_ws)
        local ws = current_ws.id

        if not isExistingInTb(ws) then
            hl.config({ scrolling = { column_width = BIG } })
        else
            hl.config({ scrolling = { column_width = col_state_tb[ws] } })
        end
    end
)
