-- Keybinds for applications and launchers
local P = require("modules.keybinds.constants")

local F = require("modules.keybinds.functions")
local toggleWindowTray = F.toggleWindowTray

local function getRofiScript(name)
    return "pkill rofi || " .. P.rofiScript .. "/" .. name
end

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
    { "D", function() toggleWindowTray("discord", nil, "discord") end, " Discord" },
    { "A", function()
        toggleWindowTray("com.github.th_ch.youtube_music", nil,
            "youtube-music --enable-wayland-ime --enable-features=UseOzonePlatform --ozone-platform=wayland")
    end, " Music" },

    -- Launchers
    { "R", "walker -t rofi", "󱓞 Launcher" },
    { "V", getRofiScript("cliphist.sh"), " ClipBoard" },
    { "Semicolon", getRofiScript("rofiEmoji.sh"), "󰞅 Emoji" },
    { "SHIFT + W", getRofiScript("websearch.sh"), " WebSearch" },
    { "SHIFT + R", getRofiScript("launcher-style-changer"), "SwitchLauncher" },

    -- waybar
    { "ALT + B", "pkill -SIGUSR1 waybar", "KillWaybar" },
    { "B", P.hyprScript .. "/waybarSelect.sh", "WaybarSelector" },
    { "SHIFT + B", P.hyprScript .. "/waybarRestart.sh", "RestartWaybar" },

    -- Wallpaper
    { "ALT + W", P.hyprScript .. "/wallSelect.sh", "WallpaperSelector" },
    { "Q", "pkill waypaper || waypaper", "Waypaper" },
    { "SHIFT + Q", "waypaper --random", "RandomWallpaper" },
    { "SHIFT + T", P.hyprScript .. "/refresh.sh", "RefreshTheme" },

    -- Notifications
    { "N", "swaync-client -t -sw", "󰂞 Notification" },
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

hl.bind(P.mod .. " + SHIFT + TAB",
    function()
        hl.plugin.hymission.open("onlycurrentworkspace")
    end,
    { description = "Open Overview" }
)
