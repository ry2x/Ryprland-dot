-- Keybinds for applications and launchers
local P = require("modules.keybinds.constants")

local function rofi_toggle(name)
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
    { "D", P.hyprScript .. "/toggleWindowTray.sh \"discord\" \"discord\"", " Discord" },
    { "A", P.hyprScript .. "/toggleWindowTray.sh \"com.github.th_ch.youtube_music\" \"youtube-music --enable-wayland-ime --enable-features=UseOzonePlatform --ozone-platform=wayland\"", " Music" },

    -- Launchers
    { "R", rofi_toggle("launcher"), "󱓞 Launcher" },
    { "V", rofi_toggle("cliphist.sh"), " ClipBoard" },
    { "Semicolon", rofi_toggle("rofiEmoji.sh"), "󰞅 Emoji" },
    { "SHIFT + W", rofi_toggle("websearch.sh"), " WebSearch" },
    { "SHIFT + R", rofi_toggle("launcher-style-changer"), "SwitchLauncher" },

    -- waybar
    { "ALT + B", "pkill -SIGUSR1 waybar", "KillWaybar" },
    { "B", P.hyprScript .. "/waybarSelect.sh", "WaybarSelector" },
    { "SHIFT +B", P.hyprScript .. "/waybarRestart.sh", "RestartWaybar" },

    -- Wallpaper
    { "ALT + W", P.hyprScript .. "/wallSelect.sh", "WallpaperSelector" },
    { "Q", "pkill waypaper || waypaper", "Waypaper" },
    { "SHIFT + Q", "waypaper --random", "RandomWallpaper" },
    { "SHIFT + T", P.hyprScript .. "/refresh.sh", "RefreshTheme" },

    -- Notifications
    { "N", "swaync-client -t -sw", "󰂞 Notification" },

    -- Toggle Layout
    --{ "SHIFT + TAB", P.hyprScript .. "/toggleLayout.sh", "ToggleLayout" }
}

for _, bind in ipairs(ApplicationBinds) do
    hl.bind(P.mod .. " +" .. bind[1], hl.dsp.exec_cmd(bind[2]), { description = bind[3] })
end

hl.bind(P.mod .. " + SHIFT + TAB", function()
    hl.plugin.hymission.open("onlycurrentworkspace")
end, { description = "Open Overview" })
