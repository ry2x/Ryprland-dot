-- Keybinds for function keys, media control, and brightness
local P = require("modules.keybinds.constants")
local hyprScript = P.hyprScript
local mod = P.mod

local fn_binds = {
    -- Volume, mic, brightness
    { "XF86AudioRaiseVolume",  hyprScript .. "/volume.sh --inc",        "Volume Up" },
    { "XF86AudioLowerVolume",  hyprScript .. "/volume.sh --dec",        "Volume Down" },
    { "XF86AudioMute",         hyprScript .. "/volume.sh --toggle",     "Volume Mute" },
    { "XF86AudioMicMute",      hyprScript .. "/volume.sh --toggle-mic", "Mic Mute" },
    { "ALT + M",               hyprScript .. "/volume.sh --mic-inc",    "Mic Volume Up" },
    { "ALT + SHIFT + M",       hyprScript .. "/volume.sh --mic-dec",    "Mic Volume Down" },
    { "XF86MonBrightnessUp",   hyprScript .. "/backlight.sh --inc",     "Brightness Up" },
    { "XF86MonBrightnessDown", hyprScript .. "/backlight.sh --dec",     "Brightness Down" },

    -- Media control
    { "XF86AudioNext",         "playerctl next",                        "Play next" },
    { "XF86AudioPause",        "playerctl play-pause",                  "Play/Pause" },
    { "XF86AudioPlay",         "playerctl play-pause",                  "Play/Pause" },
    { "XF86AudioPrev",         "playerctl previous",                    "Play previous" }
}

for _, bind in ipairs(fn_binds) do
    hl.bind(bind[1], hl.dsp.exec_cmd(bind[2]), { description = bind[3] })
end

-- function submap for keyboard which has no default keybinds for media control and brightness
hl.bind(mod .. " + F1",
    function()
        hl.dispatch(hl.dsp.submap("fnlayer"))
        hl.dispatch(hl.dsp.exec_cmd("notify-send -e -u low -i \"" ..
            P.icon .. "/fn_key_filled.png\" 'Function Layer Activated'"))
    end,
    { description = "Function Layer" }
)

local function_binds = {
    -- brightness F1 F2
    { "F1",  hyprScript .. "/backlight.sh --dec", "Brightness Down" },
    { "F2",  hyprScript .. "/backlight.sh --inc", "Brightness Up" },

    -- volume F10 F11 F12
    { "F10", hyprScript .. "/volume.sh --toggle", "Volume Mute" },
    { "F11", hyprScript .. "/volume.sh --dec",    "Volume Down" },
    { "F12", hyprScript .. "/volume.sh --inc",    "Volume Up" },

    -- playerctl F7 F8 F9
    { "F7",  "playerctl previous",                "Play previous" },
    { "F8",  "playerctl play-pause",              "Play/Pause" },
    { "F9",  "playerctl next",                    "Play next" }
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
                hl.dispatch(hl.dsp.exec_cmd("notify-send -e -u low -i \"" ..
                    P.icon .. "/fn_key_outline.png\" 'Function Layer Deactivated'"))
            end,
            { description = "Back to Default Layer" }
        )
    end
)
