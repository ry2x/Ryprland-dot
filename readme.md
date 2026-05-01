# Ryprland-dotfile

![](./Ryprland.png)

This repository is my personal configuration files with [Hyprland](https://hypr.land), a dynamic tiling Wayland compositor.
This configurations are heavily based on [Matuprland](https://github.com/Abhra00/Matuprland).
I think Matuprland is a great dotfile, but I want to make it use my own style and preferences, so I forked it and made several changes.

> [!IMPORTANT]
> I'll try to keep it up to date with the latest changes in Hyprland, but I won't be able to provide support for it. If you want to use it, you can fork it and make your own changes.

## How to use

> [!WARNING]
> You need to have a backup of your current configuration files before using this repository, because it will overwrite your current configuration files.
> And also, you need to have [GNU Stow](https://www.gnu.org/software/stow/) installed to use this repository.

1. Clone the repository to your local machine.

```bash
git clone https://github.com/ry2x/Ryprland-dot
cd ./Ryprland-dot
```

2. Stow the configuration files to your home directory.

```bash
stow ./base

stow ./host-desktop # For desktop
#or
stow ./host-laptop # For laptop

#optional 
stow ./nvim-yazi # For neovim and yazi
```

3. Re-login to apply the changes.

4. Enjoy your new Hyprland configuration!

## Directory structure

- `base/`: Contains the base configuration files that are common for both desktop and laptop.
- `host-desktop/`: Contains the configuration files that are specific for desktop.
- `host-laptop/`: Contains the configuration files that are specific for laptop.
- `nvim-yazi/`: Contains the configuration files for neovim and yazi.
- `private-dotfile/`: Not publicly available, contains my private information.
- `README.md`: This file.

## Requirements

Install these packages before using this dotfile setup:

- Core: hyprland, hyprlock, hypridle, stow, awww, imagemagick, jq
- Hypr ecosystem: hyprbind, hyprcrop, hyprpicker
- Desktop UI: waybar, rofi, swaync
- Configuration Application: waypaper, nwg-look, kvantum, nmgui, pavucontrol
- CLI Application: bat, cava, cliphist, fastfetch, fish, starship, yazi, fum, yt-x
- Other application: kitty, pear-desktop, thunar, fcitx5 (with mozc), gnome-keyring, power-profiles-daemon, swayimg
- AUR/helper: paru, par_tui

### Fonts

- GTK: SF Pro Regular 11
- Qt: Noto Sans CJK JP 12
- Coding: Fira Code Regular 12

## 日本語入力とmozc辞書について

このセットアップでは、fcitx5 + mozc で日本語入力を行います。
辞書は、fcitx5-mozc-ext-neologd または fcitx5-mozc-ut の利用をおすすめします。
fcitx5-mozc-ut を使う場合は、先に mozc-ut をインストールしてから fcitx5-mozc-ut をインストールしてください。

多くの人は fcitx5 <-> mozc の切り替えで入力していると思いますが、私は mozc(Direct) <-> mozc(Hiragana) の切り替えで運用しています。
設定方法は [Zennの記事](https://zenn.dev/ry2x/scraps/451ecfdc0a5c07) にまとめています。
