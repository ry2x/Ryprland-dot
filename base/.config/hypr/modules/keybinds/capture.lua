-- Keybinds for screen capture and recording
local P = require("modules.keybinds.constants")
local mod = P.mod
local hyprScript = P.hyprScript

local captures = {
    -- screenshot
    { mod .. "+S",               "hyprcrop monitor",                            "Capture screen" },
    { mod .. "+SHIFT + S",       "hyprcrop freeze",                             "Clipping screen" },
    { "Print",                   "hyprcrop all",                                "Capture area" },

    -- record screen
    { mod .. "+ALT + R",         hyprScript .. "/record.sh",                    "Record region (no sound)" },
    { "CTRL + ALT + R",          hyprScript .. "/record.sh --fullscreen",       "Record screen (no sound)" },
    { mod .. "+SHIFT + ALT + R", hyprScript .. "/record.sh --fullscreen-sound", "Record screen (with sound)" }
}

for _, capture in ipairs(captures) do
    hl.bind(capture[1], hl.dsp.exec_cmd(capture[2]), { description = capture[3] })
end
