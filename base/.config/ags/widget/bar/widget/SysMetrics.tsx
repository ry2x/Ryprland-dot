import { Gdk, Gtk } from 'ags/gtk4';

import { LucideIcon } from '../../../lib/lucide';
import { cpuUsage, gpuUsage, ramUsage } from '../../../services/system';
import { toggleControlCenter } from '../../../services/windowManager';

export default function SysMetrics({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const toggleMenu = () => {
    toggleControlCenter(gdkmonitor.get_connector());
  };

  const formatPercent = (val: number) => {
    const rounded = Math.round(val);
    const capped = rounded >= 100 ? 99 : rounded;
    return capped.toString().padStart(2, '0');
  };

  return (
    <button class="SysMetrics" onClicked={toggleMenu}>
      <box spacing={10} orientation={Gtk.Orientation.VERTICAL}>
        <box spacing={0} orientation={Gtk.Orientation.VERTICAL}>
          <LucideIcon name="cpu" class="icon" css="margin-bottom: 4px;" />
          <label label={cpuUsage.as(formatPercent)} css="font-size: 0.9em;" />
          <label label="%" css="font-size: 0.75em;" />
        </box>
        <box spacing={0} orientation={Gtk.Orientation.VERTICAL}>
          <LucideIcon name="memory-stick" class="icon" css="margin-bottom: 4px;" />
          <label label={ramUsage.as((r) => r.used.toFixed(1))} css="font-size: 0.9em;" />
          <label label="GB" css="font-size: 0.75em;" />
        </box>
        <box spacing={0} orientation={Gtk.Orientation.VERTICAL}>
          <LucideIcon name="gpu" class="icon" css="margin-bottom: 4px;" />
          <label label={gpuUsage.as(formatPercent)} css="font-size: 0.9em;" />
          <label label="%" css="font-size: 0.75em;" />
        </box>
      </box>
    </button>
  );
}
