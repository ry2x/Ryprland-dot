-- Keybinds for power management and system actions
local P = require("modules.keybinds.constants")

hl.bind(P.mod .. " + X", hl.dsp.exec_cmd(P.hyprScript .. "/wlogout.sh"), { description = "⏻ PowerMenu" })
hl.bind(P.mod .. " + L", hl.dsp.exec_cmd("hyprlock"), { description = " Lock screen" })
hl.bind("CTRL + ALT + Delete", hl.dsp.exit(0), { description = "⏻ Exit Hyprland" })
