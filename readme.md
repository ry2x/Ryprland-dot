# Ryprland-dotfiles

This repository is my personal configuration files for Hyprland, a dynamic tiling Wayland compositor. It includes my settings for Hyprland itself, as well as configurations for various applications and tools that I use alongside it.

## Originals

The original configurations can be found in the following repositories:
> [Matuprland](https://github.com/Abhra00/Matuprland)

I have made several modifications to suit my personal preferences and workflow.

## Using Stow

This repository uses GNU Stow to manage the dotfiles. To set up the configurations on your system, follow these steps:

1. Clone the repository to your local machine:

```bash
git clone https://github.com/yourusername/Ryprland-dotfiles.git
cd Ryprland-dotfiles
```

2. Use Stow to create symlinks for the desired configurations. For example, to set up the Hyprland configuration, run:

```bash
stow hypr
```

Repeat this step for other configurations as needed (e.g., `alacritty`, `nvim`, `waybar`, etc.).
