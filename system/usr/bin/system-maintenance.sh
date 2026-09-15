#!/usr/bin/env bash

# Perform conservative, recurring maintenance for an Arch/CachyOS system.
# Keep two cached package versions; remove uninstalled-package caches (requires pacman-contrib).
# Remove archived journals older than 30 days and apply tmpfiles.d age rules.
# Report orphans and failed units only; leave user caches and trash untouched.

set -euo pipefail

readonly package_versions_to_keep=2
readonly journal_retention=30days

usage() {
    cat <<'EOF'
Usage: system-maintenance.sh [--dry-run | --execute]

  --dry-run  Show files eligible for cleanup without deleting them (default).
  --execute  Clean package caches, journals, and systemd-tmpfiles entries.
  --help     Show this help.

The script never removes installed packages or arbitrary user cache directories.
EOF
}

mode=dry-run

case "${1:-}" in
    ""|--dry-run)
        ;;
    --execute)
        mode=execute
        ;;
    --help|-h)
        usage
        exit 0
        ;;
    *)
        usage >&2
        exit 2
        ;;
esac

if (( $# > 1 )); then
    usage >&2
    exit 2
fi

if (( EUID != 0 )); then
    printf 'Run as root, for example: sudo system-maintenance.sh --%s\n' "$mode" >&2
    exit 1
fi

section() {
    printf '\n==> %s\n' "$1"
}

section "Pacman package cache"
if command -v paccache >/dev/null 2>&1; then
    if [[ "$mode" == execute ]]; then
        # Keep two cached versions of installed packages for downgrade recovery.
        paccache --remove --keep "$package_versions_to_keep" --verbose
        # Packages which are no longer installed do not need cached archives.
        paccache --remove --uninstalled --keep 0 --verbose
    else
        printf 'Installed packages (keeping %d versions):\n' "$package_versions_to_keep"
        paccache --dryrun --keep "$package_versions_to_keep" --verbose
        printf 'Uninstalled packages:\n'
        paccache --dryrun --uninstalled --keep 0 --verbose
    fi
else
    printf 'Skipped: paccache is not installed (package: pacman-contrib).\n'
fi

section "System journal"
journalctl --disk-usage
if [[ "$mode" == execute ]]; then
    journalctl --vacuum-time="$journal_retention"
else
    printf 'Would remove archived journal files older than %s.\n' "$journal_retention"
fi

section "Temporary files managed by systemd"
if [[ "$mode" == execute ]]; then
    systemd-tmpfiles --clean
else
    systemd-tmpfiles --clean --dry-run
fi

section "Diagnostics (report only)"
if orphaned_packages="$(pacman --query --deps --unrequired --quiet)"; then
    if [[ -z "$orphaned_packages" ]]; then
        printf 'No orphaned packages found.\n'
    else
        printf 'Orphaned packages (not removed):\n'
        while IFS= read -r package; do
            printf '  %s\n' "$package"
        done <<< "$orphaned_packages"
    fi
else
    printf 'Could not query orphaned packages.\n' >&2
fi

if failed_units="$(systemctl --failed --no-legend --plain)"; then
    if [[ -z "$failed_units" ]]; then
        printf 'No failed systemd units found.\n'
    else
        printf 'Failed systemd units (not modified):\n'
        printf '%s\n' "$failed_units"
    fi
else
    printf 'Could not query failed systemd units.\n' >&2
fi

printf '\nSystem maintenance %s completed.\n' "$mode"
