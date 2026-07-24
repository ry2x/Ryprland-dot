import { createState } from 'ags';
import { execAsync } from 'ags/process';
import { interval } from 'ags/time';

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

export interface RamData {
  used: number;
  total: number;
  percent: number;
}

export const [cpuUsage, setCpuUsage] = createState(0);
export const [ramUsage, setRamUsage] = createState<RamData>({ used: 0, total: 0, percent: 0 });
export const [gpuUsage, setGpuUsage] = createState(0);
export const [uptime, setUptime] = createState('0m');

export const systemPoll = interval(2000, () => {
  execAsync(['bash', `${GLib.getenv('HOME')}/.config/ags/scripts/system_metrics.sh`])
    .then((out) => {
      try {
        const data = JSON.parse(out);
        setCpuUsage(data.cpu);
        setRamUsage(data.ram);
        setGpuUsage(data.gpu);
        if (data.uptime) {
          setUptime(data.uptime);
        }
      } catch (e) {
        console.error('Failed to parse system metrics:', e);
      }
    })
    .catch((err) => {
      console.error('system_metrics.sh failed:', err);
    });
});
