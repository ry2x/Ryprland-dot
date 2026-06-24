-- Keybinds for power management and system actions
local P = require("modules.constants")
local mod = P.mod

hl.bind(mod .. " + X", hl.dsp.exec_cmd(P.hyprScript .. "/wlogout.sh"), { description = "⏻ PowerMenu" })
hl.bind(mod .. " + L", hl.dsp.exec_cmd("hyprlock"), { description = " Lock screen" })
hl.bind("CTRL + ALT + Delete", hl.dsp.exit(0), { description = "⏻ Exit Hyprland" })
