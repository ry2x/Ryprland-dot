-- ┏┓┳┳┏┳┓┏┓  ┏┓┏┳┓┏┓┳┓┏┳┓
-- ┣┫┃┃ ┃ ┃┃  ┗┓ ┃ ┣┫┣┫ ┃
-- ┛┗┗┛ ┻ ┗┛  ┗┛ ┻ ┛┗┛┗ ┻

hl.on("hyprland.start",
    function()
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

            -- wallpaper
            "killall -q awww-daemon awww; sleep 0.5; awww-daemon --format xrgb & sleep 1; waypaper --restore",

            -- applets
            "blueman-applet",
            "fcitx5 -d",
            "discord --start-minimized",

            -- bar & notifications
            "sleep 3; ags run"
        }

        for _, app in ipairs(autostart) do
            hl.exec_cmd(app)
        end
    end
)
