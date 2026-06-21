local P = require("modules.keybinds.constants")
local mod = P.mod
local smw = P.smw
local electronOptions = P.electronOptions

local F = require("modules.keybinds.utils")
local sendNotification = F.sendNotification
local toggleWindowTray = F.toggleWindowTray

local ws_nm = "game"
local dp_nm = "DP-2"

-- move focused window to game workspace
hl.bind(mod .. " + SHIFT + G", smw.move_to_workspace_silent("name:" .. ws_nm),
    { description = "Move window to game workspace" }
)


-- game workspace
local last_cursor_x = 0
local last_cursor_y = 0
local last_workspace = nil

local function startGaming()
    -- get current workspace and cursor position
    local cursor = hl.get_cursor_pos()
    if not cursor then
        return
    end

    local current_dp = hl.get_active_monitor()
    if not current_dp then
        return
    end

    local last_ws = hl.get_active_workspace(current_dp)
    if not last_ws then
        return
    end

    -- get DP-2 monitor and workspace
    local dp = hl.get_monitor(dp_nm)
    if not dp then
        return
    end

    local ws = hl.get_active_workspace(dp)
    if not ws then
        return
    end

    last_cursor_x = cursor.x
    last_cursor_y = cursor.y
    last_workspace = last_ws.name

    hl.dispatch(smw.workspace("name:" .. ws_nm))
    hl.dispatch(hl.dsp.submap("gaming"))
    sendNotification(P.icon .. "/gamemode.png", "Game Mode ON", "All keybinds are disabled \nWIN + F12 to EXIT")
end

local function exitGaming()
    hl.dispatch(hl.dsp.submap("reset"))

    if last_workspace then
        hl.dispatch(smw.workspace(last_workspace))
    end
    hl.dispatch(hl.dsp.cursor.move({ x = last_cursor_x, y = last_cursor_y }))
    sendNotification(P.icon .. "/gamemode.png", "Game Mode OFF", "")
end

hl.define_submap("gaming",
    function()
        -- workspaces moving emits notification
        for i = 1, 5 do
            hl.bind(mod .. " + " .. tostring(i),
                function()
                    sendNotification(P.icon .. "/gamemode.png", "Running Game Mode",
                        "All keybinds are disabled \nWIN + F12 to EXIT")
                end,
                { description = "Game Mode: Keybinds Disabled" }
            )
        end

        -- discord and youtube music
        hl.bind(mod .. " + D",
            function()
                toggleWindowTray("discord", "", "discord")
            end,
            { description = "Toggle Discord" }
        )
        hl.bind(mod .. " + A",
            function()
                toggleWindowTray("com.github.th_ch.youtube_music", "", "youtube-music " .. electronOptions)
            end,
            { description = "Toggle Youtube Music" }
        )

        -- kill window
        hl.bind(mod .. "+ C",
            function()
                sendNotification(P.icon .. "/gamemode.png", "Running Game Mode",
                    "WIN + C is disabled \nWIN + CTRL + C to KILL")
            end,
            { description = "Game Mode: Keybinds Disabled" }
        )
        hl.bind(mod .. "+ CTRL + C", hl.dsp.window.close(), { description = "Kill window" })

        -- exit hyprland
        hl.bind("CTRL + ALT + Delete", hl.dsp.exit(0), { description = "⏻ Exit Hyprland" })

        -- exitGaming
        hl.bind(mod .. " + F12", exitGaming, { description = "Exit game workspace" })
    end
)

hl.bind(mod .. " + G", startGaming, { description = "Switch to game workspace" })
