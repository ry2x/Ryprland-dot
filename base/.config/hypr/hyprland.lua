-- ┓┏┓┏┏┓┳┓┓ ┏┓┳┓┳┓  ┏┓┏┓┳┓┏┓┳┏┓
-- ┣┫┗┫┃┃┣┫┃ ┣┫┃┃┃┃  ┃ ┃┃┃┃┣ ┃┃┓
-- ┛┗┗┛┣┛┛┗┗┛┛┗┛┗┻┛  ┗┛┗┛┛┗┻ ┻┗┛

-- SPDX-FileCopyrightText: 2026 Ry2X
-- SPDX-License-Identifier: GPL-3.0-or-later

-- environment variables
require("modules.env")

-- autostart
require("modules.autostart")

-- inputs (keyboard, mouse, touch)
require("modules.inputs")

-- devices (config per device)
require("modules.devices")

-- monitors
require("modules.monitors")

-- settings (misc, layouts, plugin etc)
require("modules.settings")

-- workspaces
require("modules.workspace")

-- decorations (tearing setting)
require("modules.decorations")

-- animations
require("modules.animations")

-- window rules
require("modules.window")

-- keybinds
require("modules.keybinds")
