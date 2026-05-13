-- ┏┓┳┓┓┏  ┓┏┏┓┳┓┳┏┓┳┓┓ ┏┓┏┓
-- ┣ ┃┃┃┃  ┃┃┣┫┣┫┃┣┫┣┫┃ ┣ ┗┓
-- ┗┛┛┗┗┛  ┗┛┛┗┛┗┻┛┗┻┛┗┛┗┛┗┛


local envs = {
    -- cursor
    { "HYPRCURSOR_THEME",                    "M200" },
    { "HYPRCURSOR_SIZE",                     "24" },
    { "XCURSOR_THEME",                       "M200" },
    { "XCURSOR_SIZE",                        "24" },

    -- toolkit
    { "CLUTTER_BACKEND",                     "wayland" },
    { "GDK_BACKEND",                         "wayland",           "x11", "*" },
    { "GDK_SCALE",                           "1" },

    -- XDG
    { "XDG_CURRENT_DESKTOP",                 "Hyprland" },
    { "XDG_SESSION_DESKTOP",                 "Hyprland" },
    { "XDG_SESSION_TYPE",                    "wayland" },

    -- QT
    { "QT_AUTO_SCREEN_SCALE_FACTOR",         "1" },
    { "QT_SCALE_FACTOR",                     "1" },
    { "QT_QPA_PLATFORM",                     "wayland" },
    { "QT_QPA_PLATFORMTHEME",                "qt6ct" },
    { "QT_QPA_PLATFORMTHEME",                "qt5ct" },
    { "QT_STYLE_OVERRIDE",                   "Fusion" },
    { "QT_WAYLAND_DISABLE_WINDOWDECORATION", "1" },
    { "QT_QUICK_CONTROLS_STYLE",             "org.hyprland.style" },

    -- Firefox
    { "MOZ_ENABLE_WAYLAND",                  "1" },

    -- Electron apps (recommend to use flag file)
    { "ELECTRON_OZONE_PLATFORM_HINT",        "auto" },

    -- JAVA (Generally not recommended)
    { "JAVA_AWT_WM_NONREPARENTING",          "1" },

    -- Fcitx5
    { "INPUT_METHOD",                        "fcitx" },
    { "QT_IM_MODULE",                        "fcitx" },
    { "XMODIFIERS",                          "@im=fcitx" },
    { "SDL_IM_MODULE",                       "fcitx" },
    { "GLFW_IM_MODULE",                      "fcitx" },

    -- Fix AQUA under RDNA4
    { "AQ_NO_MODIFIERS",                     "1" }

    -- sdl2 apps
    -- Run SDL2 applications on Wayland.
    -- Remove or set to x11 if games that provide older versions of SDL cause compatibility issues
    -- { "SDL_VIDEODRIVER",                     "wayland" },
}

for _, env in ipairs(envs) do
    hl.env(table.unpack(env))
end
