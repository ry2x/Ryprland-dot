import { execAsync } from 'ags/process';
import { createPoll } from 'ags/time';

import GLib from 'gi://GLib?version=2.0';

import { closeAllControlCenters } from './windowManager';

export const userName = '@' + GLib.get_user_name();

export function getOsInfo(): string {
  let osName = 'Linux';
  try {
    if (GLib.file_test('/etc/os-release', GLib.FileTest.EXISTS)) {
      const [success, bytes] = GLib.file_get_contents('/etc/os-release');
      if (success && bytes) {
        const text = new TextDecoder('utf-8').decode(bytes);
        const match = text.match(/PRETTY_NAME="([^"]+)"/);
        if (match) {
          osName = match[1];
        }
      }
    }
  } catch (error) {
    console.error('Failed to read os-release:', error);
  }

  const wm = GLib.getenv('XDG_CURRENT_DESKTOP') || GLib.getenv('DESKTOP_SESSION') || 'Hyprland';
  return `${osName} • ${wm}`;
}

export function openSystemMonitor() {
  closeAllControlCenters();
  execAsync('kitty --title TempTerminal btm').catch(console.error);
}

export const cpuUsage = createPoll(0, 2000, () =>
  execAsync(['bash', '-c', "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'"])
    .then((out) => {
      const val = parseFloat(out);
      return isNaN(val) ? 0 : val;
    })
    .catch(() => 0),
);

export interface RamData {
  used: number;
  total: number;
  percent: number;
}

export const ramUsage = createPoll<RamData>({ used: 0, total: 0, percent: 0 }, 2000, () =>
  execAsync(['bash', '-c', "free -m | grep Mem | awk '{print $3, $2}'"])
    .then((out) => {
      const [usedMiB, totalMiB] = out.split(' ').map(Number);
      if (isNaN(usedMiB) || isNaN(totalMiB) || totalMiB === 0) {
        return { used: 0, total: 0, percent: 0 };
      }
      return {
        used: usedMiB / 1024,
        total: totalMiB / 1024,
        percent: usedMiB / totalMiB,
      };
    })
    .catch(() => ({ used: 0, total: 0, percent: 0 })),
);

export const gpuUsage = createPoll(0, 2000, () =>
  execAsync([
    'bash',
    '-c',
    'cat /sys/class/drm/card*/device/gpu_busy_percent 2>/dev/null | sort -nr | head -n 1',
  ])
    .then((out) => {
      const val = parseFloat(out);
      return isNaN(val) ? 0 : val;
    })
    .catch(() => 0),
);
