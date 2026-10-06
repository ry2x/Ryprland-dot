# Repository structure

```text
Ryprland-dot/
├── base/                  # Main user configurations symlinked to $HOME by GNU Stow
│   ├── .config/           # Hyprland (modular Lua), kitty, matugen, rofi, etc.
│   └── .local/bin/        # ryprland entry point, runtime helpers, and theme-switch.sh
├── docs/                  # Setup and usage guides
├── lib/
│   └── rystal-shell/      # Rystal-shell source code (TypeScript / Astal / AGS submodule)
├── nvim-yazi/             # Optional package for Neovim and Yazi configurations
├── scripts/               # Deployment and setup scripts called by ryprland
├── system/                # System-level configurations mirroring /etc and /usr
├── private-dotfile/       # Optional private configuration submodule
├── applist.md             # Required and optional package list
└── readme.md              # Project documentation
```

The `ryprland` Bash entry point resolves its Stow symlink back to this checkout.
`ryprland deploy rystal-shell` and `ryprland deploy remote-desktop` invoke scripts
under `scripts/`; `ryprland setup system` invokes `scripts/setup-system.sh` with `sudo`
when needed. Options are forwarded to each script.
`ryprland set greeter-background IMAGE` calls `scripts/set-greeter-background.sh`
to convert and apply the system login screen background.

## Rystal-shell Standalone Usage

While `Ryprland-dot` integrates tightly with `rystal-shell`, **Rystal-shell itself is designed to run independently using environment variables and standard XDG directory fallbacks**.

> [!IMPORTANT]
> Standalone installation does not require Ryprland, but the current implementation uses Hyprland APIs.

See the standalone guide for requirements and the development guide for environment setup:

- Documentation & Configuration: [lib/rystal-shell/README.md](../lib/rystal-shell/README.md)
- [Standalone installation](../lib/rystal-shell/docs/installation.md)
- [Development](../lib/rystal-shell/docs/development.md)

[Back to the project overview](../readme.md)
