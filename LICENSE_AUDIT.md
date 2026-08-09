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

The inherited fish/bash setup was replaced with independently authored zsh
configuration. The replacement was implemented from written requirements and
official documentation rather than by mechanically rearranging the inherited
files.

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

An independently implemented zsh configuration was added and validated as the
login shell. Files carrying the Ry2X SPDX notice are licensed under
`GPL-3.0-or-later`. The package-managed zsh plugins are runtime dependencies
and are not vendored into this repository.

After successful login-shell validation, the inherited `base/.bashrc`,
`base/.config/bashrc/`, and `base/.config/fish/` files were removed. Their
historical provenance remains documented below, but they are no longer part of
the distributed tree.

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
- At the initial audit, before the shell cleanup, 65 files had a direct path
  counterpart in that historical Matuprland revision and 35 remained
  byte-for-byte identical. This was a lower bound and excluded renamed,
  reorganized, converted, and subsequently modified files.

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

- substantial portions of `base/.config/hypr/`
- `base/.config/matugen/`
- `base/.config/Kvantum/`
- `base/.config/cava/`
- `base/.config/kitty/`
- portions of `base/.config/rofi/`, `fastfetch/`, and `wlogout/`
- several files under `base/.local/bin/`

At the initial audit, all 11 fish files had a direct historical Matuprland
counterpart. They were removed after the independently implemented zsh setup
was validated. The same replacement approach should be used for other
substantial inherited components instead of relying on mechanical edits.

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

`base/.config/kitty/utils/scroll_mark.py` is from the same
kitty-kitten-search project and is covered by its GPL-3.0 terms. The remaining
Kitty configuration files were inherited from Matuprland and remain outside
this confirmed GPL mapping.

Recommended action: retain the source comment and record the source revision
from which the local modifications were made.

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

### JaKooLit shell scripts

The following scripts originate from
[JaKooLit Hyprland-Dots](https://github.com/JaKooLit/Hyprland-Dots) repository
and were inherited through Matuprland:

- `base/.config/hypr/scripts/wlogout.sh`;
- `base/.config/rofi/scripts/clipboard-history.sh`;
- `base/.config/rofi/scripts/emoji-select.sh`.

JaKooLit Hyprland-Dots distributes these scripts under GPL-3.0. The GPL v3
text is preserved as `LICENSES/GPL-3.0.txt`, and each local script records its
source and modified status. The JaKooLit history notes an earlier ZaneyOS
source for the emoji script; this attribution chain should be retained if a
more exact source revision is later recorded.

Recommended action: identify the closest source revisions when practical and
do not relabel the modified local scripts as independently authored.

### sysfetch

The former `base/.local/bin/sysfetch.sh` credited `u/x_ero` and said it was
modified by `gh0stzk`. The inspected
[gh0stzk/dotfiles](https://github.com/gh0stzk/dotfiles) repository is
GPL-3.0. The former Ryprland copy differed substantially from the current
upstream file, but the former local copy retained the explicit provenance.

Resolution: the script was unused and was removed on 2026-08-09. No copy is
distributed by the current repository.

### shebang.sh

The former `base/.local/bin/shebang.sh` credited `steampunknyanja` and an old
CrunchBang forum URL, but contained no license. No permission could be
confirmed during this audit.

Resolution: the script was unused and was removed on 2026-08-09. No copy is
distributed by the current repository.

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

The current `nvim-yazi/.config/nvim/` configuration is confirmed by its author
as a complete, independent replacement. It is licensed by Ry2X under
`GPL-3.0-or-later`; this does not change the licenses of plugins fetched by the
configuration.

## Assets and opaque files requiring provenance work

The following are distributed without nearby authorship or license metadata:

- `Ryprland.png`;
- `base/.config/fastfetch/Ascii-Art/` and
  `base/.config/fastfetch/Images/icon.png`;
- PNG files under `base/.config/hypr/icons/`;
- uosc fonts and the `ziggy-*` executables, whose upstream project is known but
  whose bundled revision is not recorded.

The wlogout icons were subsequently identified as part of the GPL-3.0
[JaKooLit Hyprland-Dots](https://github.com/JaKooLit/Hyprland-Dots)
distribution. The obsolete `base/.config/hypr/modules/old.tar.gz`, which held
an earlier configuration, was removed on 2026-08-09.

Usage review on 2026-08-09 found:

- `Ryprland.png` is used by `readme.md`;
- Fastfetch currently uses `Images/icon.png`, while all nine files under
  `Ascii-Art/` are unreferenced;
- six Hyprland icons are used by the Lua configuration: `gamemode.png`, both
  `fn_key_*` icons, and the three `layout_*` icons; the other 22 icons are
  unreferenced;
- wlogout CSS uses ten icons; `sleep.png` and `sleep-hover.png` are
  unreferenced. All twelve remain covered by the JaKooLit GPL-3.0 mapping.

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
The unresolved `sysfetch.sh` provenance did not require further remediation
because the unused script was removed in Phase 4.

### Phase 3: shell migration (completed 2026-08-09)

The independently implemented zsh configuration was validated as the login
shell. The inherited fish and bash configuration was then removed. The new zsh
files carry explicit Ry2X copyright and `GPL-3.0-or-later` SPDX notices.

### Phase 4: replace unlicensed and unknown material (in progress)

Prioritize substantial executable code and opaque assets:

1. ~~`shebang.sh`~~ (unused; removed 2026-08-09);
2. ~~any remaining Matuprland-derived shell scripts~~ (resolved 2026-08-09);
3. ~~`sysfetch.sh`~~ (unused; removed 2026-08-09);
4. unknown icons, ASCII art, and images;
5. remaining Matuprland-derived theme/configuration groups.

For simple configuration, replacement can be incremental. A single factual
setting or tool-prescribed initialization command often offers little room for
creative expression; distinctive scripts, comments, organization, and visual
assets deserve more caution.

#### Remaining shell-script comparison (2026-08-09)

The remaining scripts were compared against Matuprland commit
`0377d0666460445b96a88e60fa23bc3bccbc34bb`. The following files have direct
historical counterparts and should still be treated as inherited or derived:

| Ryprland path | Historical Matuprland path | Current relationship |
| --- | --- | --- |
| `base/.config/hypr/hyprlock/check-capslock.sh` | `hypr/hyprlock/check-capslock.sh` | Independently replaced 2026-08-09 |
| `base/.config/hypr/hyprlock/status.sh` | `hypr/hyprlock/status.sh` | Independently replaced 2026-08-09 |
| `base/.config/hypr/scripts/wlogout.sh` | `hypr/scripts/wlogout.sh` | Modified JaKooLit GPL-3.0 work |
| `base/.config/rofi/scripts/clipboard-history.sh` | `rofi/scripts/cliphist.sh` | Modified JaKooLit GPL-3.0 work |
| `base/.config/rofi/scripts/emoji-select.sh` | `rofi/scripts/rofiEmoji.sh` | Modified JaKooLit GPL-3.0 work; JaKooLit history credits ZaneyOS |
| `base/.config/rofi/scripts/web-search.sh` | `rofi/scripts/websearch.sh` | Independently replaced 2026-08-09 |
| ~~`base/.local/bin/jpg-to-png.sh`~~ | `bin/jpg-to-png.sh` | Unused; removed 2026-08-09 |
| ~~`base/.local/bin/png-to-jpg.sh`~~ | `bin/png-to-jpg.sh` | Unused; removed 2026-08-09 |
| ~~`base/.local/bin/sysmaintainance.sh`~~ | `bin/sysmaintainance.sh` | Unused; removed 2026-08-09 |
| ~~`base/.local/bin/tty-color-tool.sh`~~ | `bin/tty-color-tool.sh` | Unused; removed 2026-08-09 |

The first six remain connected to active configuration. The three JaKooLit
works retain their upstream GPL-3.0 status and attribution. The other three
active scripts were independently replaced on 2026-08-09 and now carry Ry2X
`GPL-3.0-or-later` SPDX notices. The four inherited scripts under
`base/.local/bin/` had no references elsewhere in the repository and were
confirmed unused, so they were removed on 2026-08-09.

This resolves the shell scripts inherited through Matuprland. Scripts first
added after the initial import are not evidence of a Matuprland relationship
by repository history alone and require a separate originality or provenance
review before receiving an SPDX notice.

#### Configuration classification confirmed on 2026-08-09

- `nvim-yazi/.config/nvim/` is independently authored and licensed by Ry2X
  under `GPL-3.0-or-later`.
- `base/.config/hypr/hyprland.lua` and Lua files under
  `base/.config/hypr/modules/` are independent replacements licensed by Ry2X
  under `GPL-3.0-or-later`. This does not include the separately licensed
  split-monitor-workspaces submodule, generated Matugen output, icons,
  `hypridle.conf`, or `hyprlock.conf`.
- Rasi files under `base/.config/rofi/` no longer retain substantive
  Matuprland material and are licensed by Ry2X under `GPL-3.0-or-later`.
- `base/.config/wlogout/` originates from JaKooLit Hyprland-Dots and remains
  under GPL-3.0.
- `base/.config/kitty/common.conf`, `dev.conf`, and `kitty.conf` remain
  Matuprland-derived. The two files under `kitty/utils/` are instead mapped to
  kitty-kitten-search GPL-3.0 above.
- The Fastfetch configuration remains Matuprland-derived. Its images and ASCII
  art require separate provenance checks.
- Most Matugen templates are original Matuprland material with no further
  upstream identified. The exceptions still need to be classified file by
  file before this directory can receive a coherent license declaration.

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
