-- Window rules for floating windows

local M = require("modules.window.floating_helper")
local withDefaults = M.makeRuleWithDefaults
local applyWindowRules = M.applyWindowRules

---------------------
-- center floating --
---------------------
local CENTER_BASE = {
    float = true,
    center = true,
    animation = "popin 80%"
}

hl.window_rule(withDefaults(CENTER_BASE, {
    match = { tag = "center_float_big" },
    size = { "monitor_w * 0.8", "monitor_h * 0.8" },
}))

hl.window_rule(withDefaults(CENTER_BASE, {
    match = { tag = "center_float_half" },
    size = { "monitor_w * 0.5", "monitor_h * 0.5" },
}))

local centerFloating = {
    { { class = "^(nwg-look)$" },                                  "center_float_half" },
    { { class = "^(kvantummanager)$" },                            "center_float_half" },
    { { class = "^(qt5ct)$" },                                     "center_float_half" },
    { { class = "^(qt6ct)$" },                                     "center_float_half" },
    { { class = "^(org.kde.polkit-kde-authentication-agent-1)$" }, "center_float_half" },
    { { title = "^(HyprBind.*)$" },                                "center_float_half" },
    -- file dialogs
    { { class = "^(org.gnome.FileRoller)$" },                      "center_float_big" },
    { { initial_title = "^(Open File)$" },                         "center_float_big" },
    { { title = "^(Choose Files)$" },                              "center_float_big" },
    { { title = "^(Save As)$" },                                   "center_float_big" },
    { { title = "^(Confirm to replace files)$" },                  "center_float_big" },
    { { title = "^(File Operation Progress)$" },                   "center_float_big" },
    { { title = "^(Rename.*)$" },                                  "center_float_big" },
    -- terminal
    { { title = "^(TempTerminal)$" },                              "center_float_big" },
    { { title = "^(yazi)$" },                                      "center_float_half" },
    { { title = "^(PacUpdate)$" },                                 "center_float_big" },
}

applyWindowRules(centerFloating)

-------------------------
-- top pinned floating --
-------------------------
local TOP_GAP = 45
local PINNED_TOP_BASE = {
    float = true,
    animation = "slide top",
    pin = true
}

hl.window_rule(withDefaults(PINNED_TOP_BASE, {
    match = { tag = "pin_float_big" },
    size = { "monitor_w * 0.8", "monitor_h * 0.8" },
    move = { "monitor_w * 0.1", tostring(TOP_GAP) }
}))

hl.window_rule(withDefaults(PINNED_TOP_BASE, {
    match = { tag = "pin_float_mini" },
    size = { "monitor_w * 0.3", "monitor_h * 0.5" },
    move = { "monitor_w * 0.35", tostring(TOP_GAP) }
}))

local pinFloating = {
    -- toggle applications
    { { class = "^(com.github.th-ch.youtube-music)$" }, "pin_float_big" },
    { { class = "^(discord)$" },                        "pin_float_big" },
    -- xdg-desktop-portal dialogs
    { { class = "^(xdg-desktop-portal-gtk)$" },         "pin_float_big" },
    { { class = "^(xdg-desktop-portal-kde)$" },         "pin_float_big" },
    -- share picker
    { { class = "^(hyprland-share-picker)$" },          "pin_float_big" },
    -- setting apps
    { { class = "^(org.pulseaudio.pavucontrol)$" },     "pin_float_mini" },
    { { class = "^(blueman-manager)$" },                "pin_float_mini" },
    { { class = "^(com.network.manager)$" },            "pin_float_mini" },
    { { class = "^(nz.co.mega.megasync)$" },            "pin_float_mini" }
}

applyWindowRules(pinFloating)

--------------------
-- other floating --
--------------------

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

-- Waydroid input should be ignored
hl.window_rule({
    match = { class = "^([Ww]aydroid.InputMethod)$" },
    workspace = "special:magic silent",
    no_initial_focus = true,
    no_focus = true
})

-- waypaper (left bottom)
hl.window_rule({
    match = { class = "^(waypaper)$" },
    animation = "slide left",
    float = true,
    pin = true,
    move = { "3", "monitor_h - window_h -5" }
})
