-- ┳┳┏┳┓┳┓ ┏┓
-- ┃┃ ┃ ┃┃ ┗┓
-- ┗┛ ┻ ┻┗┛┗┛

local P = require("modules.constants")

local F = {}

F.toggleWindowTray = function(win_class, title, cmd)
    local ws = hl.get_active_workspace()
    if not ws then
        return
    end

    for _, window in ipairs(hl.get_windows()) do
        local match_class = win_class and window.class == win_class
        local match_title = title and window.title == title

        if match_class or match_title then
            hl.dispatch(hl.dsp.window.close({ window = window }))
            if window.workspace == ws then
                return
            end
        end
    end

    hl.dispatch(hl.dsp.exec_cmd(cmd))
end

F.getRofiScript = function(name)
    return "pkill -u \"$USER\" -x rofi 2>/dev/null || " .. P.rofiScript .. "/" .. name
end

F.getHyprScript = function(name)
    return P.hyprScript .. "/" .. name
end

F.sendNotification = function(image, title, message)
    hl.dispatch(hl.dsp.exec_cmd(string.format("notify-send -e -u low -n \"%s\" '%s' '%s'", image, title, message)))
end

F.killActiveProcess = function()
    local active = hl.get_active_window()
    if not active then
        return
    end

    local pid = active.pid
    hl.dispatch(hl.dsp.exec_cmd("kill " .. pid))
end

F.loadCSV = function(filename)
    local data = {}
    local file = io.open(filename, "r")
    if not file then return nil end

    for line in file:lines() do
        local key, value = line:match("^([^,]+),([^,]+)$")
        if key and value then
            data[key] = value
        end
    end

    file:close()
    return data
end

F.saveCSV = function(filename, data)
    local file = io.open(filename, "w")
    if not file then
        return
    end

    local keys = {}
    for key in pairs(data) do
        table.insert(keys, key)
    end

    table.sort(keys, function(left, right)
        return left < right
    end)

    for _, key in ipairs(keys) do
        file:write(key .. "," .. data[key] .. "\n")
    end

    file:close()
end

return F
