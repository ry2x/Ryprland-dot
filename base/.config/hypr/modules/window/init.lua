-- ┓ ┏┳┳┓┳┓┏┓┓ ┏  ┳┓┳┳┓ ┏┓┏┓
-- ┃┃┃┃┃┃┃┃┃┃┃┃┃  ┣┫┃┃┃ ┣ ┗┓
-- ┗┻┛┻┛┗┻┛┗┛┗┻┛  ┛┗┗┛┗┛┗┛┗┛


local window_modules = {
    "floating",
    "window",
    "window_game",
    "opacity",
    "layer"
}

for _, module in ipairs(window_modules) do
    require("modules.window." .. module)
end
