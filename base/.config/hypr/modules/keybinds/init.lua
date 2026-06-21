-- ┓┏┓┏┓┓┏┳┓┳┳┓┳┓┏┓
-- ┃┫ ┣ ┗┫┣┫┃┃┃┃┃┗┓
-- ┛┗┛┗┛┗┛┻┛┻┛┗┻┛┗┛

local keybind_modules = {
    "applications",
    "workspace",
    "workspace_game",
    "window",
    "power",
    "capture",
    "fnkey"
}
    
for _, module in ipairs(keybind_modules) do
    require("modules.keybinds." .. module)
end
