import { createState } from 'ags';
import { execAsync } from 'ags/process';

import GLib from 'gi://GLib?version=2.0';

import { closeAllControlCenters } from './windowManager';

export function openUpdateManager() {
  closeAllControlCenters();
  execAsync('kitty --title PacUpdate par_tui')
    .then(() => refreshUpdates())
    .catch(console.error);
}

export const [updatesPoll, setUpdates] = createState('0');

export function refreshUpdates() {
  execAsync([
    'bash',
    '-c',
    "ping -c 1 -W 2 archlinux.org >/dev/null && timeout 15 bash -c '(checkupdates 2>/dev/null; paru -Qu 2>/dev/null) | wc -l'",
  ])
    .then((out) => {
      setUpdates(out);
    })
    .catch((err) => {
      console.error(err);
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, () => {
        refreshUpdates();
        return GLib.SOURCE_REMOVE;
      });
    });
}

refreshUpdates();
GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000 * 30, () => {
  refreshUpdates();
  return GLib.SOURCE_CONTINUE;
});
