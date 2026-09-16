-- Keybinds for function keys, media control, and brightness
local P = require("modules.constants")
local mod = P.mod

local F = require("modules.utils")
local sendNotification = F.sendNotification

local fn_binds = {
    -- Volume, mic, brightness
    { "XF86AudioRaiseVolume",  "ags request -i rystal-shell volume up",            "Volume Up" },
    { "XF86AudioLowerVolume",  "ags request -i rystal-shell volume down",          "Volume Down" },
    { "XF86AudioMute",         "ags request -i rystal-shell volume toggle",        "Volume Mute" },
    { "XF86AudioMicMute",      "ags request -i rystal-shell mic toggle",           "Mic Mute" },
    { "ALT + M",               "wpctl set-volume -l 1 @DEFAULT_AUDIO_SOURCE@ 5%+", "Mic Volume Up" },
    { "ALT + SHIFT + M",       "wpctl set-volume @DEFAULT_AUDIO_SOURCE@ 5%-",      "Mic Volume Down" },
    { "XF86MonBrightnessUp",   "ags request -i rystal-shell brightness up",        "Brightness Up" },
    { "XF86MonBrightnessDown", "ags request -i rystal-shell brightness down",      "Brightness Down" },

    -- Media control
    { "XF86AudioNext",         "playerctl next",                                   "Play next" },
    { "XF86AudioPause",        "playerctl play-pause",                             "Play/Pause" },
    { "XF86AudioPlay",         "playerctl play-pause",                             "Play/Pause" },
    { "XF86AudioPrev",         "playerctl previous",                               "Play previous" }
}

for _, bind in ipairs(fn_binds) do
    hl.bind(bind[1], hl.dsp.exec_cmd(bind[2]), { description = bind[3] })
end

-- function submap for keyboard which has no default keybinds for media control and brightness
hl.bind(mod .. " + F1",
    function()
        hl.dispatch(hl.dsp.submap("fnlayer"))
        sendNotification(P.icon .. "/fn_key_filled.png", "ON: Function Layer", "")
    end,
    { description = "Function Layer" }
)

local function_binds = {
    -- brightness F1 F2
    { "F1",  "ags request -i rystal-shell brightness down", "Brightness Down" },
    { "F2",  "ags request -i rystal-shell brightness up",   "Brightness Up" },

    -- volume F10 F11 F12
    { "F10", "ags request -i rystal-shell volume toggle",   "Volume Mute" },
    { "F11", "ags request -i rystal-shell volume down",     "Volume Down" },
    { "F12", "ags request -i rystal-shell volume up",       "Volume Up" },

    -- playerctl F7 F8 F9
    { "F7",  "playerctl previous",                          "Play previous" },
    { "F8",  "playerctl play-pause",                        "Play/Pause" },
    { "F9",  "playerctl next",                              "Play next" }
}

hl.define_submap("fnlayer",
    function()
        for _, bind in ipairs(function_binds) do
            hl.bind(bind[1],
                function()
                    hl.dispatch(hl.dsp.exec_cmd(bind[2]))
                end,
                { description = bind[3] }
            )
        end
        hl.bind("escape",
            function()
                hl.dispatch(hl.dsp.submap("reset"))
                sendNotification(P.icon .. "/fn_key_outline.png", "OFF: Function Layer", "")
            end,
            { description = "Back to Default Layer" }
        )
    end
)
