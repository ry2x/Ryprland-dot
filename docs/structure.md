# Repository structure

```text
Ryprland-dot/
├── base/                  # Main user configurations symlinked to $HOME by GNU Stow
│   ├── .config/           # Hyprland (modular Lua), kitty, matugen, rofi, etc.
│   └── .local/bin/        # Ryprland helpers and its extended theme-switch.sh
├── docs/                  # Setup and usage guides
├── lib/
│   └── rystal-shell/      # Rystal-shell source code (TypeScript / Astal / AGS submodule)
├── nvim-yazi/             # Optional package for Neovim and Yazi configurations
├── system/                # System-level configurations mirroring /etc and /usr
├── private-dotfile/       # Optional private configuration submodule
├── applist.md             # Required and optional package list
└── readme.md              # Project documentation
```

## Rystal-shell Standalone Usage

While `Ryprland-dot` integrates tightly with `rystal-shell`, **Rystal-shell itself is designed to run independently using environment variables and standard XDG directory fallbacks**.

Standalone installation does not require Ryprland, but the current implementation uses Hyprland APIs.
See the standalone guide for requirements and the development guide for environment setup:

- Documentation & Configuration: [lib/rystal-shell/README.md](../lib/rystal-shell/README.md)
- [Standalone installation](../lib/rystal-shell/docs/installation.md)
- [Development](../lib/rystal-shell/docs/development.md)

[Back to the project overview](../readme.md)
