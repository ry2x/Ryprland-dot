# Installation

This guide covers initial setup, from installing dependencies to enabling optional system services and checking their operation.

> [!IMPORTANT]
> After cloning, run the remaining commands from the repository root.

## Requirements

Before installing, install the required packages:

- Package List: [applist.md](../applist.md)
- Essential tools:
    - `stow` (GNU Stow)
    - `pnpm` (for building Rystal-shell)
    - `aylurs-gtk-shell-git` & `libastal-meta` (AUR packages for the GUI shell)

### Recommended fonts

- **GTK / Qt UI**: SF Pro Regular 11
- **Rystal-shell / Hyprlock / ReGreet / Rofi UI**: SF Pro (sizes vary by component)
- **Terminal / coding font**: Firple 12

> [!NOTE]
> For Arch users, `SF Pro` is provided by apple-fonts AUR package.

## Installation & Setup

### 1. Clone the repository & submodules

```bash
git clone https://github.com/ry2x/Ryprland-dot.git
cd Ryprland-dot
git submodule update --init --recursive
```

> [!NOTE]
> Maintainer memo: initialize `private-dotfile/` explicitly with:
>
> ```bash
> git submodule update --init --recursive --checkout -- private-dotfile
> ```

### 2. Stow configurations into `$HOME`

> [!WARNING]
> GNU Stow creates symlinks in your `$HOME`. Back up existing configurations in
> `~/.config/` and review the dry-run (`-n`) output before applying the links.

```bash
# Preview
stow -n -v -t "$HOME" base

# Apply
stow -t "$HOME" base

# (Optional) Preview and apply Neovim and Yazi configurations
stow -n -v -t "$HOME" nvim-yazi
stow -t "$HOME" nvim-yazi
```

Once `base` is stowed, `~/.local/bin/ryprland` provides the repository's deployment
and setup commands. It resolves its Stow symlink to find scripts in this checkout,
so commands work from any directory:

```bash
ryprland --help
ryprland deploy rystal-shell
ryprland deploy remote-desktop --no-restart
ryprland setup system --help
```

When upgrading from the separate `deploy-rystal-shell` and
`deploy-ryprland-remote-desktop` helpers, Stow may leave their old symlinks behind.
After applying the new links, remove only dangling symlinks for those helpers:

```bash
for helper in deploy-rystal-shell deploy-ryprland-remote-desktop; do
    link="$HOME/.local/bin/$helper"
    if [[ -L "$link" && ! -e "$link" ]]; then
        unlink "$link"
    fi
done
```

### 3. Build and deploy Rystal-shell

Build and deploy through the `ryprland` entry point:

```bash
ryprland deploy rystal-shell
```

> [!NOTE]
> If Rystal-shell is already running, the helper restarts it after replacing the deployed files.

This installs the Rystal-shell-owned launcher, compiles the TypeScript shell from
`lib/rystal-shell/`, and atomically deploys the bundle, assets, and theme stylesheets into
`${XDG_DATA_HOME:-$HOME/.local/share}/rystal-shell/`.

### 4. (Optional) System-level setup

System-level files under `system/` mirror `/etc` and `/usr` paths (including greetd, ReGreet, systemd timers, and backgrounds):

> [!IMPORTANT]
> Install the dependencies in [applist.md](../applist.md) first.
> See [Remote login](./remote-login.md) for setup and validation.

```bash
ryprland setup system
```

`ryprland setup system` invokes `scripts/setup-system.sh` using `sudo` when needed.
The setup script preserves the existing greetd config unless `--enable-remote-login`
is passed, copies files, and reloads systemd and udev rules without enabling
services or restarting greetd.

#### Optional timers

Each timer runs weekly. Enable only the tasks you want:

| Timer                      | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `cachyos-mirrorlist.timer` | Update the CachyOS mirror list using `rate-mirrors`     |
| `rkhunter.timer`           | Run a Rootkit Hunter check (requires `rkhunter`)        |
| `system-maintenance.timer` | Clean package caches, old journals, and temporary files |

> [!IMPORTANT]
> Run only the commands for the timers you selected. `--now` also starts each timer immediately.

```bash
sudo systemctl enable --now cachyos-mirrorlist.timer
sudo systemctl enable --now rkhunter.timer
sudo systemctl enable --now system-maintenance.timer
```

> [!CAUTION]
> `--execute` deletes eligible files. Review the `--dry-run` output before running cleanup.

```bash
# Run preview before cleanup
sudo system-maintenance.sh --dry-run

# Execute cleanup
sudo system-maintenance.sh --execute
```

Check a timer's schedule and service logs with the commands below, replacing
`system-maintenance` with `cachyos-mirrorlist` or `rkhunter` as needed:

```bash
systemctl status system-maintenance.timer system-maintenance.service
journalctl --unit=system-maintenance.service
```

### 5. Launch Hyprland

Log in to your Hyprland session. Autostart in `base/.config/hypr/modules/autostart.lua` will launch `rystal-shell` and background services automatically.

[Back to the project overview](../readme.md)
