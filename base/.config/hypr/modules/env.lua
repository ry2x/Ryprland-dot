-- ┏┓┳┓┓┏  ┓┏┏┓┳┓┳┏┓┳┓┓ ┏┓┏┓
-- ┣ ┃┃┃┃  ┃┃┣┫┣┫┃┣┫┣┫┃ ┣ ┗┓
-- ┗┛┛┗┗┛  ┗┛┛┗┛┗┻┛┗┻┛┗┛┗┛┗┛

local home = os.getenv("HOME") or ""
local path = os.getenv("PATH") or "/usr/local/bin:/usr/bin"
local local_bin = home .. "/.local/bin"
local config_home = os.getenv("XDG_CONFIG_HOME") or home .. "/.config"
local data_home = os.getenv("XDG_DATA_HOME") or home .. "/.local/share"
local cache_home = os.getenv("XDG_CACHE_HOME") or home .. "/.cache"
local state_home = os.getenv("XDG_STATE_HOME") or home .. "/.local/state"
local runtime_home = os.getenv("XDG_RUNTIME_DIR")

if not runtime_home or runtime_home == "" then
    runtime_home = "/tmp/rystal-shell-" .. (os.getenv("USER") or "user")
else
    runtime_home = runtime_home .. "/rystal-shell"
end

if not string.find(":" .. path .. ":", ":" .. local_bin .. ":", 1, true) then
    path = local_bin .. ":" .. path
end

local envs = {
    -- executable search path for Hyprland children
    { "PATH",                                path },

    -- cursor
    { "HYPRCURSOR_THEME",                    "M200" },
    { "HYPRCURSOR_SIZE",                     "24" },
    { "XCURSOR_THEME",                       "M200" },
    { "XCURSOR_SIZE",                        "24" },

    -- toolkit
    { "CLUTTER_BACKEND",                     "wayland" },
    { "GDK_BACKEND",                         "wayland",                     "x11", "*" },
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
    -- Disables explicit syncing on mgpu buffers
    { "AQ_MGPU_NO_EXPLICIT",                 "1" },

    -- ROCm/Ollama on RDNA4
    { "HIP_VISIBLE_DEVICES",                 "0" },
    { "HSA_OVERRIDE_GFX_VERSION",            "12.0.0" },

    -- Rystal-shell Env
    { "RYSTAL_SHELL_CONFIG_DIR",             config_home .. "/rystal-shell" },
    { "RYSTAL_SHELL_DATA_DIR",               data_home .. "/rystal-shell" },
    { "RYSTAL_SHELL_INSTANCE",               "rystal-shell" },
    { "RYSTAL_SHELL_WALLPAPER_DIR",          home .. "/Pictures/Wallpapers" },
    { "RYSTAL_SHELL_CACHE_DIR",              cache_home .. "/rystal-shell" },
    { "RYSTAL_SHELL_STATE_DIR",              state_home .. "/rystal-shell" },
    { "RYSTAL_SHELL_RUNTIME_DIR",            runtime_home },

    -- sdl2 apps
    -- Run SDL2 applications on Wayland.
    -- Remove or set to x11 if games that provide older versions of SDL cause compatibility issues
    -- { "SDL_VIDEODRIVER",                     "wayland" },
}

for _, env in ipairs(envs) do
    hl.env(table.unpack(env))
end
