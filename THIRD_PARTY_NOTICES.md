# Third-Party Notices

This repository is an aggregate of configuration, scripts, assets, and Git
submodules from multiple sources. The license texts under `LICENSES/` apply
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
- License text: [`LICENSES/uosc-LGPL-2.1.txt`](LICENSES/uosc-LGPL-2.1.txt)
- Local status: vendored and partially modified; the exact upstream snapshot
  has not yet been recorded

The bundled uosc copy includes additional notices in individual source files.
In particular, `lib/fzy.lua` retains its MIT notice. Those notices remain in
effect alongside the uosc license.

## thumbfast

- Upstream: [po5/thumbfast](https://github.com/po5/thumbfast)
- Local path: `base/.config/mpv/scripts/thumbfast.lua`
- License: Mozilla Public License 2.0
- License text: [`LICENSES/MPL-2.0.txt`](LICENSES/MPL-2.0.txt)
- Local status: vendored; the source file retains its MPL-2.0 notice

## kitty-kitten-search

- Upstream:
  [trygveaa/kitty-kitten-search](https://github.com/trygveaa/kitty-kitten-search)
- Local path: `base/.config/kitty/utils/search.py`
- License: GNU General Public License v3.0
- License text: [`LICENSES/GPL-3.0.txt`](LICENSES/GPL-3.0.txt)
- Local status: modified; the exact upstream revision has not yet been
  established

## Cava shaders

- Upstream: [karlstav/cava](https://github.com/karlstav/cava)
- Local path: `base/.config/cava/shaders/`
- License: MIT
- License text: [`LICENSES/cava-MIT.txt`](LICENSES/cava-MIT.txt)
- Local status: vendored through the Matuprland-derived configuration

## Catppuccin Kvantum themes

- Upstream: [catppuccin/Kvantum](https://github.com/catppuccin/Kvantum)
- Local paths:
    - `base/.config/Kvantum/catppuccin-latte-blue/`
    - `base/.config/Kvantum/catppuccin-mocha-blue/`
- License: MIT
- License text:
  [`LICENSES/catppuccin-kvantum-MIT.txt`](LICENSES/catppuccin-kvantum-MIT.txt)
- Local status: historical copies vendored through the Matuprland-derived
  configuration

## JaKooLit shell scripts

- Upstream:
  [JaKooLit/Hyprland-Dots](https://github.com/JaKooLit/Hyprland-Dots)
- Local paths:
  - `base/.config/hypr/scripts/wlogout.sh`
  - `base/.config/rofi/scripts/clipboard-history.sh`
  - `base/.config/rofi/scripts/emoji-select.sh`
- License: GNU General Public License v3.0
- License text: [`LICENSES/GPL-3.0.txt`](LICENSES/GPL-3.0.txt)
- Local status: modified and inherited through Matuprland; source and
  modification notices are retained in each script

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

## Unresolved provenance

Not every third-party file in Ryprland has been identified or cleared. In
particular, parts inherited from the unlicensed Matuprland repository and
several scripts and visual assets still require investigation or replacement.
See [`LICENSE_AUDIT.md`](LICENSE_AUDIT.md) for the current findings and cleanup
plan.
