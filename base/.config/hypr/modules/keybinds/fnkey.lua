-- Keybinds for function keys, media control, and brightness
local P = require("modules.constants")
local mod = P.mod

local F = require("modules.utils")
local getHyprScript = F.getHyprScript
local sendNotification = F.sendNotification

local fn_binds = {
    -- Volume, mic, brightness
    { "XF86AudioRaiseVolume",  getHyprScript("volume.sh --inc"),        "Volume Up" },
    { "XF86AudioLowerVolume",  getHyprScript("volume.sh --dec"),        "Volume Down" },
    { "XF86AudioMute",         getHyprScript("volume.sh --toggle"),     "Volume Mute" },
    { "XF86AudioMicMute",      getHyprScript("volume.sh --toggle-mic"), "Mic Mute" },
    { "ALT + M",               getHyprScript("volume.sh --mic-inc"),    "Mic Volume Up" },
    { "ALT + SHIFT + M",       getHyprScript("volume.sh --mic-dec"),    "Mic Volume Down" },
    { "XF86MonBrightnessUp",   getHyprScript("backlight.sh --inc"),     "Brightness Up" },
    { "XF86MonBrightnessDown", getHyprScript("backlight.sh --dec"),     "Brightness Down" },

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
        sendNotification(P.icon .. "/fn_key_filled.png", "ON: Function Layer", "")
    end,
    { description = "Function Layer" }
)

local function_binds = {
    -- brightness F1 F2
    { "F1",  getHyprScript("backlight.sh --dec"), "Brightness Down" },
    { "F2",  getHyprScript("backlight.sh --inc"), "Brightness Up" },

    -- volume F10 F11 F12
    { "F10", getHyprScript("volume.sh --toggle"), "Volume Mute" },
    { "F11", getHyprScript("volume.sh --dec"),    "Volume Down" },
    { "F12", getHyprScript("volume.sh --inc"),    "Volume Up" },

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
                sendNotification(P.icon .. "/fn_key_outline.png", "OFF: Function Layer", "")
            end,
            { description = "Back to Default Layer" }
        )
    end
)
