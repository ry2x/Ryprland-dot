-- ┏┓┏┓┏┳┓┏┳┓┳┳┓┏┓┏┓
-- ┗┓┣  ┃  ┃ ┃┃┃┃┓┗┓
-- ┗┛┗┛ ┻  ┻ ┻┛┗┗┛┗┛

hl.config({
    -- Layouts
    dwindle = {
        preserve_split = true,
        smart_split = false,
        smart_resizing = false
    },

    master = {
        new_status = "master",
        orientation = "left",
        new_on_top = true,
        allow_small_split = true,
        mfact = 0.5
    },

    scrolling = {
        column_width = 0.95
    },

    -- misc
    misc = {
        disable_hyprland_logo = true,
        disable_splash_rendering = true,
        vrr = 2,
        mouse_move_enables_dpms = true,
        enable_swallow = true,
        swallow_regex = "^()$",
        focus_on_activate = false,
        initial_workspace_tracking = 0,
        middle_click_paste = false
    },

    -- xwayland
    xwayland = {
        enabled = true,
        force_zero_scaling = true
    },

    -- fix render for gaming with RDNA4
    render = {
        -- direct_scanout = 0,
        -- new_render_scheduling = false,
        -- commit_timing_enabled = false
    }
})
