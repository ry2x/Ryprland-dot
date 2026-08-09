# SPDX-FileCopyrightText: 2026 Ry2X
# SPDX-License-Identifier: GPL-3.0-or-later

function yy() {
    local cwd_file target status

    cwd_file="$(mktemp "${TMPDIR:-/tmp}/yazi-cwd.XXXXXX")" || return 1
    command yazi "$@" --cwd-file="$cwd_file"
    status=$?

    if IFS= read -r target <"$cwd_file" &&
        [[ -n "$target" && -d "$target" && "$target" != "$PWD" ]]; then
        builtin cd -- "$target"
    fi

    rm -f -- "$cwd_file"
    return "$status"
}
