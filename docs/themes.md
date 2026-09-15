# Themes and wallpapers

Ryprland provides `theme-switch.sh` that updates Rystal-shell and the other Matugen-managed desktop themes.
Hyprland runs `theme-switch.sh refresh` after restoring the wallpaper daemon, so the saved mode is reapplied during login.

> [!IMPORTANT]
> Install the required themes before switching: `materia-gtk-theme`, `Ars-Light-Icons`,
> and `Ars-Dark-Icons`. See [Appearance assets](../applist.md#appearance-assets).

## Commands

```bash
# Apply mode with current wallpaper
theme-switch.sh mode light
theme-switch.sh mode dark

# Toggle or display the current mode
theme-switch.sh toggle
theme-switch.sh status

# Change wallpaper with current mode
theme-switch.sh set /path/to/wallpaper.jpg
theme-switch.sh random

# Refresh the current theme
theme-switch.sh refresh

# Apply a specific mode while changing the wallpaper
theme-switch.sh --light set /path/to/wallpaper.jpg
```

> [!NOTE]
> The mode (`dark` or `light`) is saved to
> `${RYSTAL_SHELL_STATE_DIR:-${XDG_STATE_HOME:-$HOME/.local/state}/rystal-shell}/mode`.
> The default is `dark` if no saved mode exists.

## GTK integration

The `theme-switch.sh` also updates `org.gnome.desktop.interface` for GTK and the Settings portal.
Light mode uses `prefer-light`, `Materia-light`, and `Ars-Light-Icons`;
dark mode uses `prefer-dark`, `Materia-dark`, and `Ars-Dark-Icons`.

> [!TIP]
> If an open GTK application does not fully apply the new theme, restart it to reload the generated CSS.

## Qt integration

The `theme-switch.sh` also updates the Qt platform theme with Kvantum widget style.

> [!TIP]
> Restart open Qt applications if the new theme does not appear.

[Back to the project overview](../readme.md)
