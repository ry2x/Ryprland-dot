-- Minimal Hyprland session used by greetd and ReGreet.

hl.monitor({
    output = "",
    mode = "preferred",
    position = "auto",
    scale = 1,
})

hl.monitor({
    output = "RMT-LOGIN",
    mode = "1920x1080@60",
    position = "0x0",
    scale = 1,
})

-- ReGreet is a single-monitor application. Prefer the largest physical output
-- for local login and mirror it to the remote output. With no physical output,
-- RMT-LOGIN remains independent and becomes the ReGreet output.
local function mirror_login()
    if not hl.get_monitor("RMT-LOGIN") then
        return
    end
    local source = nil
    for _, monitor in ipairs(hl.get_monitors()) do
        if monitor.name ~= "RMT-LOGIN" and not monitor.is_mirror then
            local area = monitor.width * monitor.height
            if not source or area > source.area then
                source = { name = monitor.name, area = area }
            end
        end
    end
    if not source then
        return
    end
    for _, monitor in ipairs(hl.get_monitors()) do
        if monitor.name ~= source.name and not monitor.is_mirror then
            hl.monitor({
                output = monitor.name,
                mode = "preferred",
                position = "auto",
                scale = 1,
                mirror = source.name,
            })
        end
    end
end

hl.on("monitor.added", mirror_login)

hl.config({
    input = {
        kb_layout = "us",
        repeat_rate = 25,
        repeat_delay = 300,
    },

    misc = {
        disable_hyprland_logo = true,
        disable_splash_rendering = true,
        force_default_wallpaper = 0,
    },

    animations = {
        enabled = false,
    },

    decoration = {
        rounding = 0,
    },
})

hl.env("GSK_RENDERER", "ngl")
hl.env("WLR_NO_HARDWARE_CURSORS", "1")

hl.on("hyprland.start", function()
    hl.exec_cmd("dbus-run-session -- /usr/bin/ryprland-greeter")
end)
