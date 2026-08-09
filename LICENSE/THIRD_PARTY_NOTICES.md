# Third-Party Notices

This repository is an aggregate of configuration, scripts, assets, and Git
submodules from multiple sources. The license texts in this directory apply
only to the components identified below; they do not establish a
project-wide license for Ryprland.

## uosc

- Upstream: [tomasklaen/uosc](https://github.com/tomasklaen/uosc)
- Local paths:
    - `base/.config/mpv/scripts/uosc/`
    - `base/.config/mpv/script-opts/uosc.conf`
    - `base/.config/mpv/fonts/uosc_icons.otf`
    - `base/.config/mpv/fonts/uosc_textures.ttf`
- License: GNU Lesser General Public License v2.1
- License text: [`uosc-LGPL-2.1.txt`](uosc-LGPL-2.1.txt)
- Local status: vendored and partially modified; the exact upstream snapshot
  has not yet been recorded

The bundled uosc copy includes additional notices in individual source files.
In particular, `lib/fzy.lua` retains its MIT notice. Those notices remain in
effect alongside the uosc license.

## thumbfast

- Upstream: [po5/thumbfast](https://github.com/po5/thumbfast)
- Local path: `base/.config/mpv/scripts/thumbfast.lua`
- License: Mozilla Public License 2.0
- License text: [`MPL-2.0.txt`](MPL-2.0.txt)
- Local status: vendored; the source file retains its MPL-2.0 notice

## kitty-kitten-search

- Upstream:
  [trygveaa/kitty-kitten-search](https://github.com/trygveaa/kitty-kitten-search)
- Local paths:
    - `base/.config/kitty/utils/search.py`
    - `base/.config/kitty/utils/scroll_mark.py`
- License: GNU General Public License v3.0
- License text: [`GPL-3.0.txt`](GPL-3.0.txt)
- Local status: inherited through Matuprland; local modifications and exact
  upstream revisions have not yet been fully recorded

## Cava shaders

- Upstream: [karlstav/cava](https://github.com/karlstav/cava)
- Local path: `base/.config/cava/shaders/`
- License: MIT
- License text: [`cava-MIT.txt`](cava-MIT.txt)
- Local status: vendored through the Matuprland-derived configuration

## Catppuccin Kvantum themes

- Upstream: [catppuccin/Kvantum](https://github.com/catppuccin/Kvantum)
- Local paths:
    - `base/.config/Kvantum/catppuccin-latte-blue/`
    - `base/.config/Kvantum/catppuccin-mocha-blue/`
- License: MIT
- License text:
  [`catppuccin-kvantum-MIT.txt`](catppuccin-kvantum-MIT.txt)
- Local status: historical copies vendored through the Matuprland-derived
  configuration

## JaKooLit Hyprland-Dots components

- Upstream:
  [JaKooLit/Hyprland-Dots](https://github.com/JaKooLit/Hyprland-Dots)
- Local paths:
    - `base/.config/wlogout/`
    - `base/.config/hypr/scripts/wlogout.sh`
    - `base/.config/rofi/scripts/clipboard-history.sh`
    - `base/.config/rofi/scripts/emoji-select.sh`
- License: GNU General Public License v3.0
- License text: [`GPL-3.0.txt`](GPL-3.0.txt)
- Local status: inherited through Matuprland. The scripts are modified and
  carry source and modification notices; wlogout is recorded as a component
  mapping here

## Separately licensed directories

The following directories carry their own license information and are not
covered by a Ryprland-wide license:

- `base/.config/ags/`: Rystal-shell, GPL-3.0-or-later, with separately licensed
  Lucide assets
- `base/.config/hypr/plugins/split-monitor-workspaces/`: BSD-3-Clause
- `nvim-yazi/.config/yazi/plugins/full-border.yazi/`: MIT
- `nvim-yazi/.config/yazi/plugins/git.yazi/`: MIT
- `nvim-yazi/.config/yazi/plugins/lazygit.yazi/`: MIT
- `nvim-yazi/.config/yazi/plugins/smart-enter.yazi/`: MIT
