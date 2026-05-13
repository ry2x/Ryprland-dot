-- Keybinds for function keys, media control, and brightness
local P = require("modules.keybinds.constants")
local hyprScript = P.hyprScript

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
