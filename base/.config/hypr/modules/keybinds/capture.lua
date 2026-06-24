-- Keybinds for screen capture and recording
local P = require("modules.constants")
local mod = P.mod

local F = require("modules.utils")
local getHyprScript = F.getHyprScript

local captures = {
    -- screenshot
    { mod .. "+S",               "hyprcrop monitor",                            "Capture screen" },
    { mod .. "+SHIFT + S",       "hyprcrop freeze",                             "Clipping screen" },
    { "Print",                   "hyprcrop all",                                "Capture area" },

    -- record screen
    { mod .. "+ALT + R",         getHyprScript("record.sh"),                    "Record region (no sound)" },
    { "CTRL + ALT + R",          getHyprScript("record.sh --fullscreen"),       "Record screen (no sound)" },
    { mod .. "+SHIFT + ALT + R", getHyprScript("record.sh --fullscreen-sound"), "Record screen (with sound)" }
}

for _, capture in ipairs(captures) do
    hl.bind(capture[1], hl.dsp.exec_cmd(capture[2]), { description = capture[3] })
end
