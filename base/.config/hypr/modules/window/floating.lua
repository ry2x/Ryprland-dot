-- Window rules for floating windows

---------------------
-- tag definitions --
---------------------

-- center floating tag
hl.window_rule({
    match = { tag = "float" },
    float = true,
    animation = "popin 80%",
    center = true
})

-- center top floating tag
hl.window_rule({
    match = { tag = "floatTop" },
    float = true,
    animation = "slide top",
    move = { "window_w * 0.25", "30" },
    pin = true
})

-- right top floating tag
hl.window_rule({
    match = { tag = "floatTopRight" },
    float = true,
    animation = "slide top",
    move = { "monitor_w * 0.7 - 10", "30" },
    pin = true
})

-- big size
hl.window_rule({
    match = { tag = "big" },
    size = { "monitor_w * 0.8", "monitor_h * 0.8" },
})

-- half size
hl.window_rule({
    match = { tag = "half" },
    size = { "monitor_w * 0.5", "monitor_h * 0.5" },
})

-- mini size
hl.window_rule({
    match = { tag = "mini" },
    size = { "monitor_w * 0.3", "monitor_h * 0.5" },
})

--------------------
-- floating rules --
--------------------

-- general floating rules
local floating = {
    { { class = "^(nwg-look)$" },                                  "mini" },
    { { class = "^(waypaper)$" },                                  "half" },
    { { class = "^(kvantummanager)$" },                            "half" },
    { { class = "^(qt5ct)$" },                                     "half" },
    { { class = "^(qt6ct)$" },                                     "half" },
    { { class = "^(org.kde.polkit-kde-authentication-agent-1)$" }, "mini" },
    { { title = "^(HyprBind.*)$" },                                "half" },
    -- file dialogs
    { { class = "^(org.gnome.FileRoller)$" },                      "big" },
    { { initial_title = "^(Open File)$" },                         "big" },
    { { title = "^(Choose Files)$" },                              "big" },
    { { title = "^(Save As)$" },                                   "big" },
    { { title = "^(Confirm to replace files)$" },                  "big" },
    { { title = "^(File Operation Progress)$" },                   "big" },
    { { class = "^(xdg-desktop-portal-gtk)$" },                    "big" },
    { { title = "^(Rename.*)$" },                                  "big" },
    -- xdg-desktop-portal dialogs
    { { class = "^(xdg-desktop-portal-gtk)$" },                    "big" },
    { { class = "^(xdg-desktop-portal-kde)$" },                    "big" },
    -- share picker
    { { class = "^(hyprland-share-picker)$" },                     "mini" },
    -- terminal
    { { title = "^(TempTerminal)$" },                              "big" },
    { { title = "^(yazi)$" },                                      "half" },
    { { title = "^(PacUpdate)$" },                                 "big" }
}

-- floating rules for right top
local right_top_floating = {
    { { class = "^(nz.co.mega.megasync)$" },        "mini" },
    { { class = "^(org.pulseaudio.pavucontrol)$" }, "mini" },
    { { class = "^(blueman-manager)$" },            "mini" },
    { { title = "^(KittyNmtui)$" },                 "mini" },
    { { class = "^(com.network.manager)$" },        "mini" }
}

-- floating rules for pin
local pin_floating = {
    { { class = "^(com.github.th_ch.youtube_music)$" }, "big" },
    { { class = "^(discord)$" },                        "big" },
}

local function apply_floating_rules(rules, float_tag)
    for _, rule in ipairs(rules) do
        hl.window_rule({
            match = rule[1],
            tag = "+" .. float_tag
        })
        hl.window_rule({
            match = rule[1],
            tag = "+" .. rule[2]
        })
    end
end

apply_floating_rules(floating, "float")
apply_floating_rules(right_top_floating, "floatTopRight")
apply_floating_rules(pin_floating, "floatTop")

-- Picture-in-picture
hl.window_rule({
    match = { title = "^(Picture[ -]in[ -][Pp]icture)$" },
    float = true,
    animation = "slide",
    size = { "520", "320" },
    move = { "monitor_w - 520", "monitor_h - window_h" },
    pin = true
})

-- Waydroid
hl.window_rule({
    match = { class = "^([Ww]aydroid.*)$" },
    float = true,
    animation = "slide",
    size = { "450", "900" },
    center = true,
    pin = true
})

hl.window_rule({
    match = { class = "^([Ww]aydroid.InputMethod)$" },
    workspace = "special:magic silent",
    no_initial_focus = true,
    no_focus = true
})
