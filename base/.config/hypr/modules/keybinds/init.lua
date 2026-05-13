-- ┓┏┓┏┓┓┏┳┓┳┳┓┳┓┏┓
-- ┃┫ ┣ ┗┫┣┫┃┃┃┃┃┗┓
-- ┛┗┛┗┛┗┛┻┛┻┛┗┻┛┗┛

local keybind_modules = {
    "applications",
    "workspace",
    "window",
    "power",
    "capture",
    "fn"
}

for _, module in ipairs(keybind_modules) do
    require("modules.keybinds." .. module)
end
