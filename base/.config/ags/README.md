# AGS Module

## Widgets

This module provides the following widgets:

### Status Bar

- Hyprland indicators

  - Workspace indicator
  - Window position indicator (for scrolling layouts)

- Weather (powered by wttr.in)
- Clock
- Package update indicator (supports `paru` and `checkupdates`)
- System resource monitor

  - CPU usage
  - RAM usage
  - GPU usage

- Volume indicator
- Fcitx5 input method indicator (filtered tray)

### App Launcher

- Search bar
- Rich UI design

### Notification Center

- Clock
- World clock
- Weather
- Calendar
- Notifications

### Control Center

- Wi-Fi controls
- Bluetooth controls
- Volume controls
- Media player

  - Play/Pause
  - Next/Previous track
  - CAVA visualizer

- Update button

## Directory Structure

```text
.
├── app.ts                 # Application entry point
├── assets/                # Static files (images, icons)
├── lib/                   # Utility libraries and helpers
├── scss/                  # Styling files
├── services/              # Background services and state management
├── style.scss             # Main stylesheet entry point
├── themes/                # Generated theme variables
└── widget/                # UI Components
    ├── app-launcher/      # Application launcher UI
    ├── bar/               # Status bar UI
    ├── common/            # Shared UI components
    ├── control-center/    # Quick settings and media controls
    ├── date-weather/      # Date, time, and weather popup
    └── notification-popups/ # On-screen notification banners
```

## Why AGS?

Maybe some people are wondering, "Why AGS? Why not QuickShell?"

Recently, QuickShell has become increasingly popular in the Hyprland community. Its memory efficiency and beautiful animations are definitely compelling reasons to choose it.

However, I'm still a beginner with both GTK and Qt. One of the main reasons I chose AGS was that I wanted to learn GObject, one of GTK's core strengths. Since I already had experience with React, I was also interested in understanding how GTK development differs from web development.

I've been reading the GJS and Gnim documentation and doing my best to avoid memory leaks wherever possible.

For those interested, here are the memory usage numbers I've observed, including the worst-case scenario:

- **Usually case:**
  - `around 350~450 MB`
- **Worst case (many notifications containing large images):**
  - Idle: `~540 MB`
  - Peak: Depends on the number of notifications and the size of the attachments.
    > I think it can be scale unlimited. I tested it with 100 notifications which has 2MB Image each, and the memory usage was around 1.7 GB

Memory usage returns to the idle level after those notifications are cleared.
(not immediately, but gjs will gc them)

## Development

### Requirements

- pnpm

### Usage

```bash
pnpm install     # init
pnpm run lint    # Run ESLint
pnpm run tsc     # Run the TypeScript type checker
pnpm run format  # Run Prettier
pnpm run build   # Build the AGS module
pnpm run start   # Start the AGS module

ags init        # generate the types for GTK4 and AGS
```
