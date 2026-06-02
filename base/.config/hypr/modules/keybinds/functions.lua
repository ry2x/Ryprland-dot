local F = {}

F.toggleWindowTray = function(win_class, title, cmd)
    local ws = hl.get_active_workspace()
    if not ws then
        return
    end

    for _, window in ipairs(hl.get_workspace_windows(ws)) do
        local match_class = win_class and window.class == win_class
        local match_title = title and window.title == title

        if match_class or match_title then
            hl.dispatch(hl.dsp.window.close({ window = window }))
            return
        end
    end

    hl.dispatch(hl.dsp.exec_cmd(cmd))
end

return F
