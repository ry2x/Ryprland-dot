# Installation

This guide covers initial setup, from installing dependencies to enabling optional
system services and checking their operation.

After cloning, run the remaining commands from the repository root.

## Requirements

Before installing, install the required packages:

- Package List: [applist.md](../applist.md)
- Essential tools:
    - `stow` (GNU Stow)
    - `pnpm` (for building Rystal-shell)
    - `aylurs-gtk-shell-git` & `libastal-meta` (AUR packages for the GUI shell)

### Recommended fonts

- **GTK UI**: SF Pro Regular 11
- **Qt UI**: SF Pro Text 12

## Installation & Setup

> [!WARNING]
> GNU Stow creates symlinks directly into your `$HOME`. Backup existing configurations in `~/.config/` before stowing.

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

Preview the symlinks first with dry-run (`-n`):

```bash
# Preview
stow -n -v base

# Apply
stow base

# (Optional) Preview and apply Neovim and Yazi configurations
stow -n -v nvim-yazi
stow nvim-yazi
```

### 3. Build and deploy Rystal-shell

Once `base` is stowed, the `deploy-rystal-shell` helper is available in your `PATH` (at `~/.local/bin/deploy-rystal-shell`):

```bash
deploy-rystal-shell
```

If Rystal-shell is already running, the helper restarts it after replacing the deployed files.

This installs the Rystal-shell-owned launcher, compiles the TypeScript shell from
`lib/rystal-shell/`, and atomically deploys the bundle, assets, and theme stylesheets into
`${XDG_DATA_HOME:-$HOME/.local/share}/rystal-shell/`.

### 4. (Optional) System-level setup

System-level files under `system/` mirror `/etc` and `/usr` paths (including greetd, ReGreet, systemd timers, and backgrounds):

```bash
sudo system/install.sh
```

The installer copies the files and reloads systemd and udev rules. It does not enable
services or timers, or restart greetd. An existing `/etc/greetd/config.toml` is preserved,
including any autologin setting; the remote-login configuration is staged separately.
The updated greeter is used the next time the login screen starts (including after logout).

Install the remote-login dependencies in [applist.md](../applist.md) before running the
installer. It grants `greeter` GPU render-node access and access to `/dev/uinput` through
a dedicated group, without granting access to physical input devices.
Follow [Remote login](./remote-login.md) to pair Moonlight, test without a physical display,
and explicitly disable autologin after validation.

#### Optional timers

Each timer runs weekly. Enable only the tasks you want:

| Timer                      | Purpose                                                 |
| -------------------------- | ------------------------------------------------------- |
| `cachyos-mirrorlist.timer` | Update the CachyOS mirror list using `rate-mirrors`     |
| `rkhunter.timer`           | Run a Rootkit Hunter check (requires `rkhunter`)        |
| `system-maintenance.timer` | Clean package caches, old journals, and temporary files |

Cleanup retains two cached versions of installed packages, removes cached packages
that are no longer installed, deletes archived journals older than 30 days, and
applies the system's `tmpfiles.d` age rules. It only reports orphaned packages and
failed units; it leaves user caches and trash untouched. Package-cache cleanup
requires `pacman-contrib`; that step is skipped when it is unavailable.

Preview cleanup before enabling its timer:

```bash
sudo system-maintenance.sh --dry-run
```

Run the corresponding commands for the timers you selected:

```bash
sudo systemctl enable --now cachyos-mirrorlist.timer
sudo systemctl enable --now rkhunter.timer
sudo systemctl enable --now system-maintenance.timer
```

To run cleanup manually after reviewing the preview:

```bash
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
