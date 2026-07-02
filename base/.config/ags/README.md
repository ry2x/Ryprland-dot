# AGS Module

### Widgets

This module provides the following widgets:

- status bar
  - Hyprland indicators
    - workspace indicator
    - window position indicator (for scrolling layout)
  - weather (using wttr.in)
  - clock
  - package update indicator (for paru and checkupdates)
  - system resource monitor (CPU, RAM, and GPU usage)
  - volume indicator
  - fcitx5 input method indicator (filtered tray)
- app launcher
  - search bar
  - rich design
- notification center
  - clock
  - world clock
  - weather
  - calendar
  - notifications
- control center
  - Wi-Fi
  - Bluetooth
  - Volume
  - Media player
    - play/pause and next/previous track
    - cava visualizer!
  - update bottom

### Development

#### requirements

- bun

#### Usage

```bash
bun install
bun run lint   # run eslint
bun run tsc    # run typechecker
bun run format # run prettier
```
