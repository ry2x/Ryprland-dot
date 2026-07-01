-- Keybinds for applications and launchers
local P = require("modules.constants")
local electronOptions = P.electronOptions

local F = require("modules.utils")
local toggleWindowTray = F.toggleWindowTray
local getRofiScript = F.getRofiScript
local getHyprScript = F.getHyprScript

local ApplicationBinds = {
    -- Applications
    { "Return", P.terminal, " Kitty" },
    { "SHIFT + Return", P.terminal_tmp, " TempTerminal" },
    { "CTRL + Return", P.terminal_dev, " Dev Terminal" },
    { "E", P.fileManager, " FileManager" },
    { "SHIFT + E", "kitty --title \"yazi\" -e yazi", " TUIFileManager" },
    { "W", P.browser, " Browser" },
    { "SHIFT + V", "pkill pavucontrol || pavucontrol", " VolumeControl" },
    { "SHIFT + U", P.updater, "󰏔 UpdatePackages" },
    { "D", function() toggleWindowTray("discord", "", "discord") end, " Discord" },
    { "A",
        function()
            toggleWindowTray("com.github.th-ch.youtube-music", "", "youtube-music " .. electronOptions)
        end,
        " Music"
    },

    -- Launchers
    { "R", "walker -t rofi", "󱓞 Launcher" }, -- Currently, I'm working on replacing Rofi with Walker
    { "V", getRofiScript("cliphist.sh"), " ClipBoard" },
    { "Semicolon", getRofiScript("rofiEmoji.sh"), "󰞅 Emoji" },
    { "SHIFT + W", getRofiScript("websearch.sh"), " WebSearch" },
    { "SHIFT + R", getRofiScript("launcher-style-changer"), "SwitchLauncher" },

    -- ags
    { "SHIFT + B", getHyprScript("restartAgs.sh"), "RestartWaybar" },
    { "ALT + B", "ags request reload-css", "Reload ags CSS" },
    { "N", "ags request toggle-notif", "󰂞 Notification" },

    -- Wallpaper
    { "ALT + W", getHyprScript("wallSelect.sh"), "WallpaperSelector" },
    { "Q", "pkill waypaper || waypaper", "Waypaper" },
    { "SHIFT + Q", "waypaper --random", "RandomWallpaper" },
    { "SHIFT + T", getHyprScript("refresh.sh"), "RefreshTheme" },
}

for _, bind in ipairs(ApplicationBinds) do
    local key_combination = P.mod .. " + " .. bind[1]
    local action = bind[2]
    local opts = { description = bind[3] }

    if type(action) == "string" then
        hl.bind(key_combination, function() hl.dispatch(hl.dsp.exec_cmd(action)) end, opts)
    elseif type(action) == "function" then
        hl.bind(key_combination, action, opts)
    end
end
