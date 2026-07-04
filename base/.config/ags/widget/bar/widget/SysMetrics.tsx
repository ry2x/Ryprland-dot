import { Gdk } from 'ags/gtk4';

import { LucideIcon } from '../../../lib/lucide';
import { cpuUsage, gpuUsage, ramUsage } from '../../../services/system';
import { toggleControlCenter } from '../../../services/windowManager';

export default function SysMetrics({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const toggleMenu = () => {
    toggleControlCenter(gdkmonitor.get_connector());
  };

  return (
    <button class="SysMetrics" onClicked={toggleMenu}>
      <box spacing={8}>
        <box spacing={4}>
          <LucideIcon name="cpu" class="icon" />
          <label label={cpuUsage.as((c) => `${Math.round(c)}%`)} />
        </box>
        <box spacing={4}>
          <LucideIcon name="memory-stick" class="icon" />
          <label label={ramUsage.as((r) => `${r.used.toFixed(1)}GB`)} />
        </box>
        <box spacing={4}>
          <LucideIcon name="gpu" class="icon" />
          <label label={gpuUsage.as((g) => `${Math.round(g)}%`)} />
        </box>
      </box>
    </button>
  );
}
