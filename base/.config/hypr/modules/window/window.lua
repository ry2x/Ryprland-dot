-- Window rules for general applications

-- Prevent sleep while fullscreen
hl.window_rule({ match = { class = ".*" }, idle_inhibit = "fullscreen" })
hl.window_rule({ match = { class = ".*" }, suppress_event = "maximize" })

-- xwaylandvideobridge
hl.window_rule({
    match = { class = "^(xwaylandvideobridge)$" },
    no_anim = false,
    no_initial_focus = false,
    max_size = { "1", "1" },
    no_blur = true
})

-- Hide screen share
hl.window_rule({
    match = { tag = "hide" },
    no_screen_share = true
})

hl.window_rule({
    match = { class = "^(1password)$" },
    tag = "+hide"
})

-- window.urgent
hl.on("window.urgent",
    function(win)
        hl.dispatch(hl.dsp.focus({ window = win }))
    end
)
