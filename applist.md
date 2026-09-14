# Packages for Ryprland-dot

This list describes the packages used by this repository on Arch Linux / CachyOS.
Install the base requirements, then select the features you use. Packages pulled in
as dependencies do not need to be installed twice. A working systemd-based Wayland
system, graphics drivers, and standard command-line tools are assumed.

See [Installation](./docs/installation.md) for setup commands. This is a dependency
guide, not a complete export of the maintainer's installed packages.

## Base requirements

### Installation and Rystal-shell

| Packages                                      | Purpose                                                       |
| --------------------------------------------- | ------------------------------------------------------------- |
| `git`, `stow`                                 | Clone submodules and link dotfiles                            |
| `sudo` or `sudo-rs`                           | Run the optional system installer and administrative commands |
| `nodejs`, `pnpm`                              | Build Rystal-shell; Node.js 24 or later is required           |
| `aylurs-gtk-shell-git`, `libastal-meta`       | AGS and Astal runtime                                         |
| `dart-sass`                                   | Compile shell styles                                          |
| `imagemagick`, `webp-pixbuf-loader`, `gsound` | Image processing, WebP loading, and shell sounds              |

The JavaScript dependencies belong to the submodule and are managed by `pnpm`.
See [Rystal-shell](./lib/rystal-shell/README.md) for its build and runtime requirements.

### Desktop, wallpaper, and themes

| Packages                                                | Purpose                                                 |
| ------------------------------------------------------- | ------------------------------------------------------- |
| `hyprland`                                              | Wayland compositor                                      |
| `kitty`                                                 | Default terminal and terminal-based shortcuts           |
| `awww`, `matugen`                                       | Wallpaper daemon and generated application themes       |
| `glib2`, `util-linux`                                   | `gsettings` and `flock`, required by the theme switcher |
| `jq`                                                    | JSON processing in desktop helpers                      |
| `psmisc`                                                | `killall`, used when restarting the wallpaper daemon    |
| `rofi`, `cliphist`, `wl-clipboard`                      | Menus and clipboard history; `wl-paste` starts at login |
| `libnotify`                                             | `notify-send` for script notifications                  |
| `hypridle`, `hyprlock`                                  | Idle handling and screen locking                        |
| `hyprpolkitagent`, `gnome-keyring`                      | Authentication agent and secret storage                 |
| `xdg-desktop-portal-hyprland`, `xdg-desktop-portal-gtk` | Desktop portals and GTK settings integration            |
| `qt6ct`, `kvantum`, `breeze-icons`                      | Qt appearance and fallback icons                        |

The GTK themes, icon themes, and fonts are listed under [Appearance assets](#appearance-assets).

### Zsh configuration

| Packages                                         | Purpose                               |
| ------------------------------------------------ | ------------------------------------- |
| `zsh`                                            | Configured interactive shell          |
| `zsh-autosuggestions`, `zsh-syntax-highlighting` | Plugins loaded directly by `.zshrc`   |
| `fastfetch`                                      | Runs when an interactive shell starts |
| `eza`                                            | Used by the `ls` aliases              |

## Feature-specific packages

These are required only for the corresponding feature. Some are referenced by the
shipped autostart entries or shortcuts; remove or change those entries when omitting
the application. Installing a package alone does not configure its system service.

### Desktop controls and capture

| Feature                                        | Packages                                                   |
| ---------------------------------------------- | ---------------------------------------------------------- |
| Audio and device selection                     | `pipewire`, `pipewire-pulse`, `wireplumber`, `pavucontrol` |
| Network controls                               | `networkmanager`, `nm-connection-editor`                   |
| Bluetooth controls and autostarted tray applet | `bluez`, `bluez-utils`, `blueman`                          |
| Backlight control                              | `brightnessctl`                                            |
| External monitor brightness via DDC/CI         | `ddcutil`                                                  |
| Media keys                                     | `playerctl`                                                |
| System monitor shortcut                        | `bottom` (provides `btm`)                                  |
| Screenshots                                    | `hyprcrop-git`                                             |
| Region selection and screen recording          | `slurp`, `wf-recorder`                                     |
| Color picker                                   | `hyprpicker`                                               |
| Alternative logout dialog                      | `wlogout`                                                  |

### Default applications and shortcuts

| Feature                        | Packages or required commands                                                               |
| ------------------------------ | ------------------------------------------------------------------------------------------- |
| File manager                   | `thunar`                                                                                    |
| Browser shortcut               | `zen-browser-bin` (provides `zen-browser`)                                                  |
| Package updater shortcut       | `par_tui`                                                                                   |
| Discord autostart and shortcut | `discord`                                                                                   |
| Music shortcut                 | `sonora-bin` (provides `sonora`)                                                            |
| Rofi web menu                  | `yt-x`, `pear-desktop-bin` (provides `youtube-music`), and an application providing `brave` |

The commands are configured in [Hyprland constants](./base/.config/hypr/modules/constants.lua),
[application shortcuts](./base/.config/hypr/modules/keybinds/applications.lua),
[autostart](./base/.config/hypr/modules/autostart.lua), and the
[Rofi web menu](./base/.config/rofi/scripts/web-search.sh).

### Japanese input

- `fcitx5`: input method framework; started automatically by this configuration
- `fcitx5-configtool`: graphical configuration tool
- `mozc-ut`, `fcitx5-mozc-ut`: the dictionary and Fcitx5 integration used with the UT setup

See [Japanese input](./docs/japanese-input.md) for dictionary alternatives and installation order.

### Editors and shell utilities

| Packages                            | Purpose                                                                     |
| ----------------------------------- | --------------------------------------------------------------------------- |
| `neovim`, `yazi`                    | Optional `nvim-yazi` Stow package; also used by shell aliases and shortcuts |
| `zsh-completions`                   | Additional completions                                                      |
| `starship`, `zoxide`, `fzf`, `mise` | Zsh integrations enabled when the commands are available                    |
| `bat`                               | File viewer with generated theme support                                    |
| `github-cli`                        | GitHub command-line client                                                  |
| `direnv`                            | Used by Rystal-shell's `pnpm dev` command                                   |

### System services and timers

| Feature                   | Packages                               |
| ------------------------- | -------------------------------------- |
| Login screen              | `greetd`, `greetd-regreet`             |
| CachyOS mirror-list timer | `rate-mirrors`                         |
| Rootkit check timer       | `rkhunter`                             |
| Package-cache cleanup     | `pacman-contrib` (provides `paccache`) |

See [System-level setup](./docs/installation.md#4-optional-system-level-setup).
The cleanup script skips package-cache cleanup when `paccache` is unavailable.

### Other optional applications

- `hyprbind`: keybinding viewer
- `swayimg`: image viewer
- `waydroid`: Android environment

### Gaming

Select these for the games and compatibility tools you use; the desktop does not require them.

- `gamemode`, `gamescope`
- `protonplus`, `protontricks`
- `wine-staging`, `wine-gecko`, `wine-mono`, `winetricks`

## Appearance assets

These are theme or font names, not necessarily package names:

| Asset                  | Configured names                                                        |
| ---------------------- | ----------------------------------------------------------------------- |
| GTK themes             | `WhiteSur-Light-nord`, `WhiteSur-Dark-nord`                             |
| Icon themes            | `Ars-Light-Icons`, `Ars-Dark-Icons`                                     |
| Cursor theme           | `M200`                                                                  |
| GTK font               | SF Pro Regular 11 (`apple-fonts` is listed as an optional font package) |
| Qt font                | Noto Sans CJK JP 12                                                     |
| Terminal / coding font | SF Pro Text 12                                                          |

See [Themes and wallpapers](./docs/themes.md) for theme locations and GTK/Qt integration.
