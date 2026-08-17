# Ryprland-dotfile

![](./Ryprland.png)

This repository contains my personal desktop configuration with [Hyprland](https://hypr.land), a dynamic tiling Wayland compositor, featuring a modular Lua configuration and **[Rystal-shell](./lib/rystal-shell)** (a custom GTK4 desktop shell built on Aylur's GTK Shell / Astal).

> [!IMPORTANT]
> This repository is maintained for personal use and kept up-to-date with Hyprland changes. Please review configurations and backup your existing dotfiles before applying.

---

## Requirements

Before installing, install the required packages:

- Package List: [applist.md](./applist.md)
- Essential tools:
  - `stow` (GNU Stow)
  - `pnpm` (for building Rystal-shell)
  - `aylurs-gtk-shell-git` & `libastal-meta` (AUR packages for the GUI shell)

### Recommended Fonts

- **GTK UI**: SF Pro Regular 11
- **Qt UI**: Noto Sans CJK JP 12
- **Terminal / Coding**: Fira Code Regular 12

---

## Installation & Setup

> [!WARNING]
> GNU Stow creates symlinks directly into your `$HOME`. Backup existing configurations in `~/.config/` before stowing.

### 1. Clone the repository & submodules

```bash
git clone https://github.com/ry2x/Ryprland-dot.git
cd Ryprland-dot
git submodule update --init --recursive
```

### 2. Stow configurations into `$HOME`

Preview the symlinks first with dry-run (`-n`):

```bash
# Preview
stow -n -v base

# Apply
stow base

# (Optional) Stow Neovim and Yazi configurations
stow nvim-yazi
```

### 3. Build and deploy Rystal-shell

Once `base` is stowed, the `deploy-rystal-shell` helper is available in your `PATH` (at `~/.local/bin/deploy-rystal-shell`):

```bash
deploy-rystal-shell
```

This installs the Rystal-shell-owned launcher, compiles the TypeScript shell from
`lib/rystal-shell/`, and atomically deploys the bundle, assets, and theme stylesheets into
`${XDG_DATA_HOME:-$HOME/.local/share}/rystal-shell/`.

### 4. (Optional) System-level setup (greetd / ReGreet)

System-level files under `system/` mirror `/etc` and `/usr` paths (including greetd, ReGreet, systemd timers, and backgrounds):

```bash
sudo system/install.sh
```

Enable desired systemd timers as needed:

```bash
sudo systemctl enable --now cachyos-mirrorlist.timer
sudo systemctl enable --now rkhunter.timer
```

### 5. Launch Hyprland

Log in to your Hyprland session. Autostart in `base/.config/hypr/modules/autostart.lua` will launch `rystal-shell` and background services automatically.

---

## Directory Structure

```
Ryprland-dot/
├── base/                  # Main user configurations symlinked to $HOME by GNU Stow
│   ├── .config/           # Hyprland (modular Lua), kitty, matugen, rofi, etc.
│   └── .local/bin/        # Ryprland helpers and its extended theme-switch.sh
├── lib/
│   └── rystal-shell/      # Rystal-shell source code (TypeScript / Astal / AGS submodule)
├── nvim-yazi/             # Optional package for Neovim and Yazi configurations
├── system/                # System-level configurations mirroring /etc and /usr
├── private-dotfile/       # Optional private configuration submodule
├── applist.md             # Required and optional package list
└── readme.md              # Project documentation
```

---

## Rystal-shell Standalone Usage

While `Ryprland-dot` integrates tightly with `rystal-shell`, **Rystal-shell itself is designed to run independently using environment variables and standard XDG directory fallbacks**.

You can run and customize Rystal-shell in any Wayland compositor with Astal support:
- Documentation & Configuration: [lib/rystal-shell/README.md](./lib/rystal-shell/README.md)
- Development mode: `cd lib/rystal-shell && pnpm dev`

---

## 日本語入力とmozc辞書について

このセットアップでは、fcitx5 + mozc で日本語入力を行います。
辞書は、`fcitx5-mozc-ext-neologd` または `fcitx5-mozc-ut` の利用をおすすめします。
`fcitx5-mozc-ut` を使う場合は、先に `mozc-ut` をインストールしてから `fcitx5-mozc-ut` をインストールしてください。

多くの人は `fcitx5 <-> mozc` の切り替えで入力していると思いますが、本構成では `mozc(Direct) <-> mozc(Hiragana)` の切り替えで運用しています。
設定方法は [Zennの記事](https://zenn.dev/ry2x/scraps/451ecfdc0a5c07) にまとめています。

---

## Licensing

This repository is an aggregate and does not currently have a single project-wide license. See the [license documentation](LICENSE/README.md) and [Rystal-shell license](lib/rystal-shell/LICENSE) for component licenses and third-party notices.
