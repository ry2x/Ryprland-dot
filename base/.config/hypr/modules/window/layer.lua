-- Layer rules
for _, namespace in ipairs({
    "waybar",
    "swaync-control-center",
    "swaync-notification-window",
    "notifications",
    "rofi",
    "logout_dialog",
}) do
    hl.layer_rule({
        match = { namespace = namespace },
        blur = true,
        ignore_alpha = 0.5
    })
end

-- xray
hl.layer_rule({
    match = { namespace = ".*" },
    xray = true
})
