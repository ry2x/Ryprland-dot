-- ┳┳┓┏┓┏┳┓┳┳┏┓┏┓┳┓  ┓┏┓┏┏┓┳┓┓ ┏┓┳┓┳┓
-- ┃┃┃┣┫ ┃ ┃┃┃┓┣ ┃┃━━┣┫┗┫┃┃┣┫┃ ┣┫┃┃┃┃
-- ┛ ┗┛┗ ┻ ┗┛┗┛┗┛┛┗  ┛┗┗┛┣┛┛┗┗┛┛┗┛┗┻┛

local M ={}

-- Image Path
M.image = "{{image}}"

-- All Colors
M.colors = {
    <* for name, value in colors *>
    {{name}} = "rgba({{value.default.hex_stripped}}ff)",
    <* endfor *>
}

return M
