-- Window rules for games and game-related applications

---------------------
-- tag definitions --
---------------------

-- game tag
hl.window_rule({
    match = { tag = "game" },
    immediate = true
})

-- floating game tag
hl.window_rule({
    match = { tag = "float_game" },
    float = true,
    center = true,
    size = { "1900", "1046" },
    immediate = true
})

-----------
-- games --
-----------

-- steam games(also proton)
hl.window_rule({
    match = { class = "^(steam_app.*)$" },
    tag = "+game"
})

-- gamescope
hl.window_rule({
    match = { class = "^(gamescope)$" },
    tag = "+game"
})

-- chill with you (idle game)
hl.window_rule({
    match = { title = "^(Chill With You)$" },
    tag = "+float_game"
})

-- mate engine x86_64 (desktop mascot)
hl.window_rule({
    match = { class = "^(MateEngineX.x86_64)$" },
    pin = true,
    size = { "885", "580" },
    move = { "3735", "860" },
    opacity = "0.9 0.9 1"
})
