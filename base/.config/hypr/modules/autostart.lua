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
            "systemctl --user import-environment WAYLAND_DISPLAY HYPRLAND_INSTANCE_SIGNATURE XDG_CURRENT_DESKTOP && systemctl --user start hyprland-session.target && remote-desktop.sh --start",

            -- clipboard manager
            "wl-paste --type text --watch cliphist store",  --text data
            "wl-paste --type image --watch cliphist store", -- image data

            -- hyprland ecosystem
            "hypridle",
            "hyprpm reload -n", -- reload hyprland extensions

            -- wallpaper
            "killall -q awww-daemon awww; sleep 0.5; awww-daemon --format xrgb & sleep 1; awww restore; theme-switch.sh refresh",

            -- bar & notifications
            "rystal-shell",
            "blueman-applet",
            "fcitx5 -d",
            "sleep 4;discord --start-minimized"
        }

        for _, app in ipairs(autostart) do
            hl.exec_cmd(app)
        end
    end
)

hl.on("hyprland.shutdown", function()
    hl.exec_cmd("systemctl --user --no-block stop ryprland-sunshine.service")
end)
