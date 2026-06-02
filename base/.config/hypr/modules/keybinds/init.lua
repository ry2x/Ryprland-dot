-- ┓┏┓┏┓┓┏┳┓┳┳┓┳┓┏┓
-- ┃┫ ┣ ┗┫┣┫┃┃┃┃┃┗┓
-- ┛┗┛┗┛┗┛┻┛┻┛┗┻┛┗┛

local keybind_modules = {
    "applications",
    "workspace",
    "window",
    "power",
    "capture",
    "fnkey"
}

for _, module in ipairs(keybind_modules) do
    require("modules.keybinds." .. module)
end
