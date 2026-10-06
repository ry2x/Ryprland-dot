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

## Login screen background

Choose a background for the system ReGreet login screen through `ryprland`:

```bash
ryprland set greeter-background /path/to/image.jpg
```

The command converts the image to PNG with ImageMagick and uses `sudo` when needed
to replace `/usr/share/backgrounds/greeter.png`. It takes effect when ReGreet next
starts, and `ryprland setup system` preserves the selected background.

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

## Sonora integration

Sonora 0.41.0 or newer supports custom theme files. Matugen generates
`~/.config/sonora/themes/matugen.json` from the active wallpaper and light/dark mode.

Run `theme-switch.sh refresh` once to generate the file, then open Sonora's
Settings > Appearance, disable **Adaptive theme**, and select **Matugen** as the theme.
Sonora watches the theme file and applies subsequent wallpaper and mode changes
without a restart.

The generated file contains only theme colors; Sonora's `settings.json` remains
managed by the application. If you previously set colors in
`appearance.theme_overrides`, clear those overrides to use the generated colors.
Font size, rounding, transparency, and other appearance options stay configurable
in Sonora.

## Vesktop integration

Run `theme-switch.sh refresh`, then enable **Custom CSS** and **Enable Window
Transparency** in Settings > Vencord. Restart Vesktop after enabling transparency;
later wallpaper and mode changes apply automatically through QuickCSS.

Customize colors and `--matugen-background-opacity` in the
[Vesktop template](../base/.config/matugen/templates/matugen-vesktop.css).
Generated QuickCSS is overwritten on each theme switch.

[Back to the project overview](../readme.md)
