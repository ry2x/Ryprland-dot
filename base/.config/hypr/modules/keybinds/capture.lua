-- Keybinds for screen capture and recording
local P = require("modules.constants")
local mod = P.mod

local captures = {
    -- screenshot
    { mod .. "+S",         "hyprcrop monitor",    "Capture screen" },
    { mod .. "+SHIFT + S", "hyprcrop freeze",     "Clipping screen" },
    { "Print",             "hyprcrop all",        "Capture area" },

    -- record screen
    { mod .. "+ALT + R",   "ags request -i rystal-shell record ", "Record region (no sound)" },
}

for _, capture in ipairs(captures) do
    hl.bind(capture[1], hl.dsp.exec_cmd(capture[2]), { description = capture[3] })
end
