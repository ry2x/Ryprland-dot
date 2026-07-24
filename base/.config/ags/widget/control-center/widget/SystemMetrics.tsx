import { Gtk } from 'ags/gtk4';

import { RamData, cpuUsage, gpuUsage, openSystemMonitor, ramUsage } from '../../../services/system';
import CircularProgress from '../../common/CircularProgress';

export default function SystemMetrics() {
  return (
    <box class="cc-card" orientation={Gtk.Orientation.HORIZONTAL} spacing={16} homogeneous hexpand>
      <box halign={Gtk.Align.CENTER}>
        <button
          css="background: transparent; border: none; box-shadow: none; padding: 0; border-radius: 50%;"
          onClicked={() => openSystemMonitor()}
        >
          <CircularProgress
            variable={cpuUsage}
            transformer={(c: number) => c / 100}
            icon="cpu"
            label="CPU"
            sublabel={cpuUsage.as((c) => `${Math.round(c)}%`)}
            cssClass="cpu-progress"
          />
        </button>
      </box>

      <box halign={Gtk.Align.CENTER}>
        <button
          css="background: transparent; border: none; box-shadow: none; padding: 0; border-radius: 50%;"
          onClicked={() => openSystemMonitor()}
        >
          <CircularProgress
            variable={ramUsage}
            transformer={(r: RamData) => r.percent}
            icon="memory-stick"
            label="RAM"
            sublabel={ramUsage.as((r) => `${r.used.toFixed(1)} / ${r.total.toFixed(0)}GB`)}
            cssClass="ram-progress"
          />
        </button>
      </box>

      <box halign={Gtk.Align.CENTER}>
        <button
          css="background: transparent; border: none; box-shadow: none; padding: 0; border-radius: 50%;"
          onClicked={() => openSystemMonitor()}
        >
          <CircularProgress
            variable={gpuUsage}
            transformer={(g: number) => g / 100}
            icon="gpu"
            label="GPU"
            sublabel={gpuUsage.as((g) => `${Math.round(g)}%`)}
            cssClass="gpu-progress"
          />
        </button>
      </box>
    </box>
  );
}
