# Ryprland license audit

Audit date: 2026-08-09

## Purpose and scope

This document records the currently identifiable origins and license status of
files distributed by Ryprland. It is intended to support a gradual cleanup,
including the planned shell migration and replacement of inherited
configuration.

The audit covers files tracked by the public `Ryprland-dot` repository at the
date above. It does not inspect the contents of `private-dotfile`. Git
submodules are treated as independently distributed projects. This is a
technical provenance review, not legal advice.

The terms **confirmed**, **inferred**, and **unknown** are used deliberately:

- **Confirmed** means that a file, repository history, or upstream license was
  inspected directly.
- **Inferred** means that history, identical content, comments, or directory
  structure strongly indicates an origin, but the exact source revision was
  not established.
- **Unknown** means that the present repository does not contain enough
  evidence to identify the author or applicable terms.

## Executive summary

Ryprland should not receive a single repository-wide license in its current
state. The repository is an aggregate containing original work, modified
Matuprland configuration, separately licensed programs and assets, unlicensed
upstream material, and independent submodules.

The most practical policy for now is:

1. Do not add an umbrella license to the Ryprland repository.
2. Preserve all existing per-file notices.
3. Preserve the restored license texts for clearly identified vendored works.
4. Treat files inherited from unlicensed Matuprland as unlicensed until they
   are replaced or permission is obtained.
5. Add an explicit license only to newly written or independently rewritten
   files whose provenance is known.

The planned move away from the inherited fish/bash setup is a good opportunity
to replace a significant coherent block with independently authored zsh
configuration. Reimplementation should start from written requirements and
official documentation, rather than by mechanically rearranging an existing
file.

### Remediation recorded on 2026-08-09

Following the initial audit, Ryprland added `THIRD_PARTY_NOTICES.md` and local
copies of the confirmed license texts for uosc, thumbfast,
kitty-kitten-search, Cava, Catppuccin Kvantum, and the JaKooLit clipboard
script. The root README now states explicitly that the repository has no
single project-wide license.

These additions restore notices for the identified components; they do not
resolve the unlicensed Matuprland-derived material, unknown asset provenance,
or exact source revisions noted below.

### Original zsh configuration added on 2026-08-09

An independently implemented zsh configuration was added alongside the
existing fish and bash configuration. Files carrying the Ry2X SPDX notice are
licensed under `GPL-3.0-or-later`. The package-managed zsh plugins are runtime
dependencies and are not vendored into this repository.

The old fish and bash files remain during the staged rollout and retain their
existing unresolved provenance status until they are removed after login-shell
validation.

## Repository-level findings

### Ryprland-dot

- No umbrella `LICENSE` applies to the repository. Confirmed third-party terms
  are collected under `LICENSES/` and indexed by `THIRD_PARTY_NOTICES.md`.
- `readme.md` explicitly says that the configuration is heavily based on
  [Matuprland](https://github.com/Abhra00/Matuprland).
- Matuprland had no repository license at commit
  `0377d0666460445b96a88e60fa23bc3bccbc34bb` (the last commit before
  Ryprland's initial import) and still had no license when inspected for this
  audit.
- Ryprland's initial commit (`8d242da`, 2025-10-21) was compared with that
  historical Matuprland tree. Of 218 files with a direct path mapping, 170
  were byte-for-byte identical.
- In the current tree, 65 files still have a direct path counterpart in that
  historical Matuprland revision; 35 remain byte-for-byte identical. This is
  a lower bound and excludes renamed, reorganized, converted, and subsequently
  modified files.

Conclusion: a blanket MIT, GPL, or other license cannot safely be applied by
the Ryprland maintainer to the whole repository. Matuprland itself also
contains material credited to several other dotfile projects, so permission
from the Matuprland maintainer alone may not resolve every file's provenance.

### Submodules

| Path                                                 | Status                                                                                  | Action                                                        |
| ---------------------------------------------------- | --------------------------------------------------------------------------------------- | ------------------------------------------------------------- |
| `base/.config/ags`                                   | Rystal-shell, confirmed `GPL-3.0-or-later`; Lucide assets retain upstream ISC/MIT terms | Keep independent; parent README may link to its license       |
| `base/.config/hypr/plugins/split-monitor-workspaces` | Confirmed BSD-3-Clause upstream                                                         | Keep independent and preserve its license                     |
| `private-dotfile`                                    | Private submodule; license not reviewed                                                 | Do not represent it as covered by any public Ryprland license |

## Confirmed and likely third-party material

### Matuprland-derived configuration

The following current groups contain files that are identical to, modified
from, or structurally descended from the historical Matuprland tree:

- `base/.config/fish/`
- `base/.bashrc` and `base/.config/bashrc/`
- substantial portions of `base/.config/hypr/`
- `base/.config/matugen/`
- `base/.config/Kvantum/`
- `base/.config/cava/`
- `base/.config/kitty/`
- portions of `base/.config/rofi/`, `fastfetch/`, and `wlogout/`
- several files under `base/.local/bin/`

All 11 current fish files have a direct historical Matuprland counterpart.
They have been edited to varying degrees, but should still be treated as
derived for provenance purposes. Merely changing order, whitespace, function
boundaries, or variable names is not a reliable way to turn them into
independent work.

Examples among the 35 current byte-identical files include:

- six Kvantum theme/configuration files;
- five Cava shader files;
- `hypr/hyprlock/check-capslock.sh`;
- both Kitty helper files;
- nine Matugen templates;
- all twelve currently tracked wlogout icon images.

Matuprland's lack of a license does not mean these files are necessarily all
owned by Matuprland. Some can be traced further to licensed projects, as
described below. Until each origin is established, however, the aggregate
should remain without a project-wide reuse grant.

### mpv uosc

`base/.config/mpv/scripts/uosc/`, the uosc fonts, and `script-opts/uosc.conf`
are vendored from [tomasklaen/uosc](https://github.com/tomasklaen/uosc).
Comparison against upstream found 40 directly mapped files, 20 currently
byte-identical. The current `main.lua` blob occurs in upstream history around
the uosc 5.12.0 release (2025-09-13).

Upstream changed to **LGPL-2.1** in 2023 and ships `LICENSE.LGPL`. A copy is
now preserved as `LICENSES/uosc-LGPL-2.1.txt` and linked from the third-party
notice.

Recommended action:

- verify the exact uosc release and retain its source correspondence,
  especially for the bundled `ziggy-*` executables; or
- preferably stop vendoring generated binaries and install uosc through a
  package/release workflow that preserves the upstream distribution metadata.

`base/.config/mpv/scripts/uosc/lib/fzy.lua` contains its own MIT notice. That
notice must remain intact.

### mpv thumbfast

`base/.config/mpv/scripts/thumbfast.lua` identifies itself as MPL-2.0 and
contains the standard source notice with a link to the license. The notice is
present, and the full MPL-2.0 text is now preserved as
`LICENSES/MPL-2.0.txt`. The exact upstream revision remains to be recorded.

### Kitty kitten search

`base/.config/kitty/utils/search.py` identifies
[trygveaa/kitty-kitten-search](https://github.com/trygveaa/kitty-kitten-search)
and says `License: GPLv3`. The upstream GPL v3 text is now preserved as
`LICENSES/GPL-3.0.txt`.

Recommended action: retain the source comment and record the source revision
from which the local modifications were made.

`base/.config/kitty/utils/scroll_mark.py` is byte-identical to the historical
Matuprland copy, but its original upstream was not established by this audit.

### Cava shaders

The tracked shaders under `base/.config/cava/shaders/` correspond to Cava's
upstream shader collection. The official
[karlstav/cava](https://github.com/karlstav/cava) repository is MIT-licensed.
The Cava copyright and MIT permission notice is now preserved as
`LICENSES/cava-MIT.txt`.

Recommended action: retain the license text and directory mapping in the
third-party notice when the shaders are updated.

### Catppuccin Kvantum themes

The Catppuccin-named files under `base/.config/Kvantum/` correspond to the
[Catppuccin Kvantum](https://github.com/catppuccin/Kvantum) project, which is
MIT-licensed. The current upstream files have changed, while the Ryprland
copies are byte-identical to the historical Matuprland copies. Ryprland does
now preserve Catppuccin's MIT notice as
`LICENSES/catppuccin-kvantum-MIT.txt`.

Recommended action: determine the closest Catppuccin revision if practical,
and retain the existing MIT notice and attribution. Do not replace the
copyright holder with the Ryprland or Matuprland author.

### JaKooLit clipboard script

`base/.config/rofi/scripts/clipboard-history.sh` contains an explicit
JaKooLit attribution. The corresponding
[JaKooLit Hyprland-Dots](https://github.com/JaKooLit/Hyprland-Dots) repository
is GPL-3.0. The GPL v3 text is now preserved as `LICENSES/GPL-3.0.txt`.

Recommended action: preserve the attribution, identify the source revision,
and do not relabel the modified local script as independently authored.

### sysfetch

`base/.local/bin/sysfetch.sh` credits `u/x_ero` and says it was modified by
`gh0stzk`. The inspected
[gh0stzk/dotfiles](https://github.com/gh0stzk/dotfiles) repository is
GPL-3.0. The current Ryprland copy differs substantially from the current
upstream file, but the explicit provenance remains.

Recommended action: retain both existing credits, determine the source
revision if possible, and include the applicable GPL-3.0 text. If the earlier
`u/x_ero` source cannot be licensed confidently, replace this script through
independent implementation or remove it.

### shebang.sh

`base/.local/bin/shebang.sh` credits `steampunknyanja` and an old CrunchBang
forum URL, but contains no license. No permission could be confirmed during
this audit.

Recommended action: treat as unlicensed; remove or independently replace it.
This is a higher-priority replacement because the file is a substantial
script rather than a few inevitable configuration statements.

### Yazi plugins

The vendored plugins below each include an MIT `LICENSE` in their own
directory:

- `full-border.yazi`
- `git.yazi`
- `lazygit.yazi`
- `smart-enter.yazi`

Their local license preservation appears structurally sound. Continue to keep
each plugin's license with its files when updating or reorganizing them.

### Neovim configuration

The initial repository contained an NvChad-derived Neovim configuration and
an Unlicense text. The current files entered their present path during the
2026-04-29 repository restructuring, but this audit did not establish whether
they are completely independent replacements or descendants of that earlier
configuration.

Recommended action: review the pre-restructure path history before assigning a
license to `nvim-yazi/.config/nvim/`. If substantive NvChad-derived content
remains, restore the relevant provenance and license notice.

## Assets and opaque files requiring provenance work

The following are distributed without nearby authorship or license metadata:

- `Ryprland.png`;
- `base/.config/fastfetch/Ascii-Art/` and
  `base/.config/fastfetch/Images/icon.png`;
- PNG files under `base/.config/hypr/icons/`;
- PNG files under `base/.config/wlogout/icons/`;
- `base/.config/hypr/modules/old.tar.gz`;
- uosc fonts and the `ziggy-*` executables, whose upstream project is known but
  whose bundled revision is not recorded.

Some of the icon files are confirmed as byte-identical to Matuprland, but
Matuprland does not establish their original license. Binary and visual assets
should not be assumed to share the license of adjacent configuration files.

Recommended action:

- record author, source URL, source revision, and license for each retained
  asset set;
- remove redundant archives such as `old.tar.gz` after confirming they are no
  longer required;
- prefer package dependencies or reproducible download instructions over
  committing third-party executables;
- replace unknown images/icons with self-created or clearly licensed assets.

## Recommended staged cleanup

### Phase 1: accurate disclosure (completed 2026-08-09)

The README now explains that Ryprland has no single project-wide license,
per-file notices take precedence, and submodules have their own licenses. It
does not grant unrestricted permission to reuse the whole repository.

A root `THIRD_PARTY_NOTICES.md` now contains the confirmed entries. License
history was checked to confirm that the recorded terms predate the relevant
imports.

### Phase 2: restore known license material (completed 2026-08-09)

In priority order:

1. uosc LGPL-2.1 notice and source/release identification;
2. kitty-kitten-search GPL-3.0 notice;
3. Cava and Catppuccin MIT notices;
4. JaKooLit GPL-3.0 notice;
5. local MPL-2.0 text for thumbfast.

The listed license texts and component mappings are now present in
`LICENSES/` and `THIRD_PARTY_NOTICES.md`. This improves compliance without
attempting to relicense any file. Exact upstream revision identification and
the uosc executable/source correspondence remain open follow-up work.
The complete provenance chain for `sysfetch.sh`, including its earlier
`u/x_ero` source, is still unresolved; it is intentionally not represented as
fully remediated by the shared GPL text.

### Phase 3: shell migration (in progress)

Use the planned zsh migration to retire the inherited fish and bash blocks.

Suggested process:

1. Write a behavior-only requirements list: environment variables, path
   entries, aliases, key bindings, prompt initialization, and autostart rules.
2. Use zsh and tool documentation as the implementation sources.
3. Implement in new empty files without translating the fish files line by
   line.
4. Use original naming, grouping, comments, and error handling.
5. Record the documentation URLs used and the implementation date.
6. Add an SPDX identifier only after confirming that no protected expression
   was copied from an incompatible or unlicensed source.

Short, functional statements that have only one or a few natural forms are
less likely to contain protectable expression, but this should not be used as
a blanket assumption for longer functions or a distinctive selection and
arrangement of settings.

### Phase 4: replace unlicensed and unknown material

Prioritize substantial executable code and opaque assets:

1. `shebang.sh`;
2. any remaining Matuprland-derived shell scripts;
3. `sysfetch.sh` if its complete license chain cannot be established;
4. unknown icons, ASCII art, and images;
5. remaining Matuprland-derived theme/configuration groups.

For simple configuration, replacement can be incremental. A single factual
setting or tool-prescribed initialization command often offers little room for
creative expression; distinctive scripts, comments, organization, and visual
assets deserve more caution.

### Phase 5: license original work

Once a file or coherent component is confirmed as original, add explicit
per-file metadata, for example:

```text
SPDX-FileCopyrightText: 2026 Ry2X
SPDX-License-Identifier: GPL-3.0-or-later
```

Use the appropriate comment syntax for the file type. A root license may be
considered only after all included material is either covered by compatible
terms, clearly excluded as an aggregate component, or removed.

## Proposed current README notice

Until the cleanup is complete, the following is an accurate conservative
statement:

```markdown
## Licensing

This repository does not currently have a single project-wide license.

It contains original configuration, files derived from third-party dotfile
projects, separately licensed scripts and assets, and Git submodules. Files
that include their own copyright or license notices remain subject to those
terms. Submodules are governed by the licenses of their respective
repositories.

Rystal-shell is licensed separately under GPL-3.0-or-later.

Unless a license is explicitly stated for a file or component, no additional
permission is granted to copy, modify, or redistribute it.
```

## Evidence and references

Repositories inspected directly:

- <https://github.com/Abhra00/Matuprland>
- <https://github.com/tomasklaen/uosc>
- <https://github.com/trygveaa/kitty-kitten-search>
- <https://github.com/gh0stzk/dotfiles>
- <https://github.com/JaKooLit/Hyprland-Dots>
- <https://github.com/karlstav/cava>
- <https://github.com/catppuccin/Kvantum>
- <https://github.com/zjeffer/split-monitor-workspaces>

General guidance:

- [GitHub: Licensing a repository](https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository)
- [Choose a License: No License](https://choosealicense.com/no-permission/)
- [文化庁 著作権テキスト](https://www.bunka.go.jp/seisaku/chosakuken/seidokaisetsu/pdf/94383901_01.pdf)

## Maintenance notes

Update this document whenever a third-party directory is added, removed, or
upgraded. For each imported component, record:

- upstream project and author;
- exact version, tag, or commit;
- local path and whether it was modified;
- SPDX license identifier;
- location of the preserved license text;
- source availability for any committed executable.
