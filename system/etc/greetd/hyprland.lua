-- Minimal Hyprland session used by greetd and ReGreet.

hl.monitor({
    output = "",
    mode = "preferred",
    position = "auto",
    scale = 1,
})

hl.config({
    input = {
        kb_layout = "us",
        repeat_rate = 25,
        repeat_delay = 300,
    },

    misc = {
        disable_hyprland_logo = true,
        disable_splash_rendering = true,
        force_default_wallpaper = 0,
    },

    animations = {
        enabled = false,
    },

    decoration = {
        rounding = 0,
    },
})

hl.env("GSK_RENDERER", "ngl")
hl.env("WLR_NO_HARDWARE_CURSORS", "1")

hl.on("hyprland.start", function()
    hl.exec_cmd("regreet --config /etc/greetd/regreet.toml; hyprctl dispatch exit")
end)
