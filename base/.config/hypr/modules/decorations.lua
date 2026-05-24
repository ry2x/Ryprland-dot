-- ┳┓┏┓┏┓┏┓┳┓┏┓┏┳┓┳┏┓┳┓┏┓
-- ┃┃┣ ┃ ┃┃┣┫┣┫ ┃ ┃┃┃┃┃┗┓
-- ┻┛┗┛┗┛┗┛┛┗┛┗ ┻ ┻┗┛┛┗┗┛

-- Import Matugen Colors
local matugen = require('matugen.matugen-hyprland')

hl.config({
    general = {
        -- Gaps
        gaps_in = 3,
        gaps_out = 10,
        gaps_workspaces = 50,

        -- Borders
        border_size = 3,
        col = {
            active_border = {
                colors = { matugen.colors.primary, matugen.colors.outline_variant },
                angle = 45
            }
        },
        resize_on_border = true,
        no_focus_fallback = true,

        allow_tearing = true,

        snap = {
            enabled = true,
        },

        layout = "scrolling"
    },

    decoration = {
        blur = {
            enabled = true,
            xray = false,
            special = false,
            new_optimizations = true,
            size = 10,
            passes = 2,
            brightness = 0.95,
            noise = 0.01,
            contrast = 1,
            popups = true,
            popups_ignorealpha = 0.6,
            input_methods = true,
            input_methods_ignorealpha = 0.8,
            ignore_opacity = true,
            vibrancy = 0.2500,
            vibrancy_darkness = 0.63
        },

        shadow = {
            enabled = true,
            sharp = false,
            range = 30,
            offset = { 0, 2 },
            render_power = 4,
            color = "rgba(171717aa)",
            color_inactive = "rgba(101010aa)"
        },

        -- Dim
        dim_special = 0.3,

        rounding = 10,

        active_opacity = 1.0,
        inactive_opacity = 1.0
    },

    group = {
        col = {
            border_active = matugen.colors.tertiary,
        },

        groupbar = {
            col = {
                active = matugen.colors.surface
            }
        }
    }
})
