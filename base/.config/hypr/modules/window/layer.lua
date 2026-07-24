-- Layer rules
for _, namespace in ipairs({
    "rofi",
    "logout_dialog",
    "hyprcrop-freeze",
    "gtk4-layer-shell"
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
    xray = false
})
