-- ┳┓┏┓┏┓┏┓┳┓┏┓┏┳┓┳┏┓┳┓┏┓
-- ┃┃┣ ┃ ┃┃┣┫┣┫ ┃ ┃┃┃┃┃┗┓
-- ┻┛┗┛┗┛┗┛┛┗┛┗ ┻ ┻┗┛┛┗┗┛

-- Import Matugen Colors
local matugen = require('matugen.matugen-hyprland')

hl.config({
    general = {
        -- Gaps
        gaps_in = 5,
        gaps_out = { top = 15, right = 14, bottom = 15, left = 10 },
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

        motion_blur = {
            enabled = true,
            samples = 5
        },

        shadow = {
            enabled = true,
            sharp = false,
            range = 18,
            offset = { 0, 2 },
            render_power = 3,
            color = "rgba(171717aa)",
            color_inactive = "rgba(101010aa)"
        },

        -- Dim
        dim_special = 0.3,

        rounding = 10,
        rounding_power = 3.0,

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
