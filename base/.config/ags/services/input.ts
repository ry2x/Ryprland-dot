import { execAsync } from 'ags/process';

import GLib from 'gi://GLib';

export function openFcitxConfig() {
  const env = GLib.getenv('QT_QPA_PLATFORMTHEME');
  execAsync(['bash', '-c', `QT_QPA_PLATFORMTHEME=${env} fcitx5-configtool`]).catch(() => {});
}

export function reloadFcitx() {
  execAsync(['fcitx5-remote', '-r']).catch(() => {});
}

export function restartFcitx() {
  execAsync(['bash', '-c', 'fcitx5 -r']).catch(() => {});
}
