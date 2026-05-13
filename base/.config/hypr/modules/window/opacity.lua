-- Window rules for opacity settings
for _, class in ipairs({
    "^([Bb]rave-.*)$",
    "^(floorp)$",
    "^(microsoft-edge-dev)$",
    "^(code-insiders-url-handler)$",
    "^(org.kde.dolphin)$",
    "^(org.kde.ark)$",
    "^(org.pulseaudio.pavucontrol)$",
    "^(nm-applet)$",
    "^(nm-connection-editor)$",
    "^(org.kde.polkit-kde-authentication-agent-1)$",
    "^(polkit-gnome-authentication-agent-1)$",
    "^(org.freedesktop.impl.portal.desktop.gtk)$",
    "^(org.freedesktop.impl.portal.desktop.hyprland)$",
    "^( [Ss]team)$",
    "^(steamwebhelper)$",
    "^(com.github.th_ch.youtube_music)$",
    "^(blueman-manager)$",
    "^(wofi)$",
    "^( [Rr]ofi)$",
    "^(SourceGit)$",
    "^(jetbrains-idea-ce)$",
    "^(jetbrains-rustrover)$",
    "^(jetbrains-idea)$",
    "^(com.github.rafostar.Clapper)$",
    "^(com.github.tchx84.Flatseal)$",
    "^(hu.kramo.Cartridges)$",
    "^(com.obsproject.Studio)$",
    "^(gnome-boxes)$",
    "^(vesktop)$",
    "^(discord)$",
    "^(WebCord)$",
    "^(ArmCord)$",
    "^(app.drey.Warp)$",
    "^(net.davidotek.pupgui2)$",
    "^(yad)$",
    "^(Signal)$",
    "^(io.github.alainm23.planify)$",
    "^(io.gitlab.theevilskeleton.Upscaler)$",
    "^(com.github.unrud.VideoDownloader)$",
    "^(io.gitlab.adhami3310.Impression)$",
    "^(io.missioncenter.MissionCenter)$",
    "^(io.github.flattool.Warehouse)$",
    "^(gcr-prompter)$"
}) do
    hl.window_rule({
        match = { class = class },
        opacity = "0.80 0.70 1"
    })
end

hl.window_rule({
    match = { title = "^(HyprBind.*)$" },
    opacity = "0.80 0.70 1"
})

-- VSCode
hl.window_rule({
    match = { class = "^([Cc]ode.*)$" },
    opacity = "0.95 0.95 1"
})
