-- ┏┓┳┳┏┳┓┏┓  ┏┓┏┳┓┏┓┳┓┏┳┓
-- ┣┫┃┃ ┃ ┃┃  ┗┓ ┃ ┣┫┣┫ ┃
-- ┛┗┗┛ ┻ ┗┛  ┗┛ ┻ ┛┗┛┗ ┻

hl.on("hyprland.start", function()
    -- Autostart applications
    local autostart = {
        -- XDPH
        "dbus-update-activation-environment --systemd WAYLAND_DISPLAY XDG_CURRENT_DESKTOP",
        "dbus-update-activation-environment --systemd --all",
        "systemctl --user import-environment WAYLAND_DISPLAY XDG_CURRENT_DESKTOP",
        "systemctl --user start hyprland-session.target",

        -- authentication agent
        "/usr/lib/polkit-gnome/polkit-gnome-authentication-agent-1",
        "/usr/lib/hyprpolkitagent/hyprpolkitagent",
        "/usr/bin/gnome-keyring-daemon --start --components=pkcs11,secrets,ssh,gpg",

        -- clipboard manager
        "wl-paste --type text --watch cliphist store",  --text data
        "wl-paste --type image --watch cliphist store", -- image data

        -- hyprland ecosystem
        "hypridle",
        "hyprpm reload -n", -- reload hyprland extensions

        -- bar
        "killall -q waybar;sleep .5 && waybar",

        -- notifications
        "killall -q swaync;sleep .5 && swaync",

        -- wallpaper
        "killall -q awww;sleep .5 && awww-daemon --format xrgb",
        "waypaper --restore",
        "$HOME/.config/hypr/scripts/wallpaper_loop.sh 3600", -- Change wallpaper every 60 minutes (in seconds)

        -- applets
        "blueman-applet",
        "fcitx5 -d",
        "discord --start-minimized"
    }

    for _, app in ipairs(autostart) do
        hl.exec_cmd(app)
    end
end)
