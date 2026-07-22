-- Keybinds for workspace management
local P = require("modules.constants")
local mod = P.mod
local smw = P.smw

local F = require("modules.utils")
local sendNotification = F.sendNotification
local saveCSV = F.saveCSV
local loadCSV = F.loadCSV

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
hl.bind(mod .. " + SHIFT + TAB", function()
        if hl.plugin and hl.plugin.scrolloverview then
            hl.plugin.scrolloverview.overview("toggle")
        end
    end,
    { description = "Toggle workspace overview" }
)

-- change layouts per workspaces
local home = os.getenv("HOME") or "."
local WS_CACHE_FILE = home .. "/.cache/hyprland/ws_cache.txt"
local ws_layouts = loadCSV(WS_CACHE_FILE) or {}

hl.bind(mod .. "+ CAPS + TAB", function()
    local layouts = { "scrolling", "dwindle", "master" }

    local workspace = hl.get_active_special_workspace() or hl.get_active_workspace()
    if not workspace then return end

    local ws_identifier = workspace.special and workspace.name or workspace.id
    local next_layout = "dwindle"

    for i, layout in ipairs(layouts) do
        if layout == workspace.tiled_layout then
            next_layout = layouts[(i % #layouts) + 1]
            break
        end
    end

    hl.workspace_rule({ workspace = tostring(ws_identifier), layout = next_layout })
    ws_layouts[tostring(ws_identifier)] = next_layout

    saveCSV(WS_CACHE_FILE, ws_layouts)

    sendNotification(
        P.icon .. "/layout_" .. next_layout .. ".png",
        "Current Layout: " .. string.upper(next_layout),
        "Layout has been changed!"
    )
end)

hl.on("workspace.active", function(current_ws)
    local ws_identifier = current_ws.special and current_ws.name or current_ws.id
    local saved_layout = ws_layouts[tostring(ws_identifier)]

    if saved_layout then
        hl.workspace_rule({ workspace = tostring(ws_identifier), layout = saved_layout })
    end
end)

hl.on("config.reloaded", function()
    local workspace = hl.get_active_special_workspace() or hl.get_active_workspace()
    if not workspace then return end

    local ws_identifier = workspace.special and workspace.name or workspace.id
    local saved_layout = ws_layouts[tostring(ws_identifier)]

    if saved_layout then
        hl.workspace_rule({ workspace = tostring(ws_identifier), layout = saved_layout })
    end
end)

hl.on("hyprland.shutdown", function()
    os.remove(WS_CACHE_FILE)
end)
