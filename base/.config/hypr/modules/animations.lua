-- ┏┓┳┓┳┳┳┓┏┓┏┳┓┳┏┓┳┓┏┓
-- ┣┫┃┃┃┃┃┃┣┫ ┃ ┃┃┃┃┃┗┓
-- ┛┗┛┗┻┛ ┗┛┗ ┻ ┻┗┛┛┗┗┛

-- enable animations
hl.config({
    animations = {
        enabled = true
    }
})

-- animation curves look https://cubic-bezier.com
hl.curve("bubbles", {
    type = "bezier",
    points = { { 0.05, 0.9 }, { 0.1, 1.05 } }
})

hl.curve("liner", {
    type = "bezier",
    points = { { 1, 1 }, { 1, 1 } }
})

hl.curve("open", {
    type = "bezier",
    points = { { 0, 0.18 }, { 0, 0.92 } }
})

hl.curve("close", {
    type = "bezier",
    points = { { 0, 0.95 }, { 0.77, 0.98 } }
})

hl.curve("move", {
    type = "bezier",
    points = { { 1, 0.9 }, { 0.22, 0.94 } }
})

-- animations
local anims = {
    { "windowsIn",           3,  "open",    "popin 50%" },
    { "windowsOut",          3,  "close",   "popin 60%" },
    { "windowsMove",         3,  "move",    "slide" },

    { "global",              5,  "bubbles", "" },
    { "border",              1,  "liner",   "" },
    { "borderangle",         30, "liner",   "loop" },
    { "fade",                10, "default", "" },

    { "workspacesIn",        4,  "bubbles", "slidevert" },
    { "workspacesOut",       4,  "bubbles", "slidevert" },

    { "specialWorkspaceIn",  4,  "bubbles", "slide" },
    { "specialWorkspaceOut", 4,  "bubbles", "slide" },

    { "layersIn",            5,  "open",    "fade" },
    { "layersOut",           5,  "close",   "fade" },

    { "fade",                3,  "close",   "" }
}

for _, anim in ipairs(anims) do
    hl.animation({
        leaf = anim[1],
        enabled = true,
        speed = anim[2],
        bezier = anim[3],
        style = anim[4]
    })
end
