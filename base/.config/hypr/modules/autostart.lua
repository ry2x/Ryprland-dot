-- ┏┓┳┳┏┳┓┏┓  ┏┓┏┳┓┏┓┳┓┏┳┓
-- ┣┫┃┃ ┃ ┃┃  ┗┓ ┃ ┣┫┣┫ ┃
-- ┛┗┗┛ ┻ ┗┛  ┗┛ ┻ ┛┗┛┗ ┻

hl.on("hyprland.start",
    function()
        -- Autostart applications
        local autostart = {
            -- SSH agent (keys are unlocked lazily through a GCR prompt)
            "systemctl --user start gcr-ssh-agent.socket",

            -- XDPH
            "dbus-update-activation-environment --systemd WAYLAND_DISPLAY HYPRLAND_INSTANCE_SIGNATURE XDG_CURRENT_DESKTOP",
            "systemctl --user start hyprland-session.target && remote-desktop.sh --start",

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
            "discord --start-minimized"
        }

        for _, app in ipairs(autostart) do
            hl.exec_cmd(app)
        end
    end
)

hl.on("hyprland.shutdown", function()
    hl.exec_cmd("systemctl --user --no-block stop ryprland-sunshine.service")
end)
