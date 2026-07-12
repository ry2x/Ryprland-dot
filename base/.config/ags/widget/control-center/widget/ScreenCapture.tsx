import { Gtk } from 'ags/gtk4';
import { execAsync } from 'ags/process';

import { LucideIcon } from '../../../lib/lucide';
import { isRecording, startRecord, stopRecord } from '../../../services/recordService';
import { closeAllControlCenters } from '../../../services/windowManager';

export default function ScreenCapture() {
  const handleScreenshot = (mode: string) => {
    closeAllControlCenters();
    setTimeout(() => {
      execAsync(`hyprcrop ${mode}`).catch(console.error);
    }, 300);
  };

  const handleRecord = (mode: 'monitor' | 'slurp') => {
    closeAllControlCenters();
    setTimeout(() => {
      startRecord(mode);
    }, 300);
  };

  const handleStop = () => {
    stopRecord();
  };

  return (
    <box class="cc-card" orientation={Gtk.Orientation.VERTICAL} spacing={12}>
      {/* Screenshot Section */}
      <box spacing={8} halign={Gtk.Align.START}>
        <LucideIcon name="fullscreen" pixelSize={20} class="color-primary" />
        <label label="Screenshot" css="font-weight: 700; font-size: 1.1em;" />
      </box>
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} homogeneous>
        <button
          class="power-btn"
          onClicked={() => handleScreenshot('crop')}
          tooltipText="Crop Region"
        >
          <box spacing={8} halign={Gtk.Align.CENTER}>
            <LucideIcon name="crop" pixelSize={18} class="color-secondary" />
            <label label="Crop" css="font-size: 0.9em;" />
          </box>
        </button>
        <button
          class="power-btn"
          onClicked={() => handleScreenshot('freeze')}
          tooltipText="Interactive Freeze"
        >
          <box spacing={8} halign={Gtk.Align.CENTER}>
            <LucideIcon name="snowflake" pixelSize={18} class="color-tertiary" />
            <label label="Freeze" css="font-size: 0.9em;" />
          </box>
        </button>
        <button
          class="power-btn"
          onClicked={() => handleScreenshot('monitor')}
          tooltipText="Monitor"
        >
          <box spacing={8} halign={Gtk.Align.CENTER}>
            <LucideIcon name="monitor" pixelSize={18} class="color-primary" />
            <label label="Monitor" css="font-size: 0.9em;" />
          </box>
        </button>
      </box>

      {/* Record Section */}
      <box spacing={8} css="margin-top: 8px;" halign={Gtk.Align.START}>
        <LucideIcon name="clapperboard" pixelSize={20} class="color-primary" />
        <label label="Screen Record" css="font-weight: 700; font-size: 1.1em;" />
      </box>

      <stack
        transitionType={Gtk.StackTransitionType.CROSSFADE}
        transitionDuration={250}
        $={(self: Gtk.Stack) => {
          const idleBox = (
            <box orientation={Gtk.Orientation.HORIZONTAL} spacing={8} homogeneous>
              <button
                class="power-btn"
                onClicked={() => handleRecord('slurp')}
                tooltipText="Record Region"
              >
                <box spacing={8} halign={Gtk.Align.CENTER}>
                  <LucideIcon name="focus" pixelSize={18} class="color-secondary" />
                  <label label="Region" css="font-size: 0.9em;" />
                </box>
              </button>
              <button
                class="power-btn"
                onClicked={() => handleRecord('monitor')}
                tooltipText="Record Monitor"
              >
                <box spacing={8} halign={Gtk.Align.CENTER}>
                  <LucideIcon name="monitor-play" pixelSize={18} class="color-tertiary" />
                  <label label="Monitor" css="font-size: 0.9em;" />
                </box>
              </button>
            </box>
          ) as Gtk.Box;

          const recordingBox = (
            <box>
              <button class="power-btn active-record" onClicked={handleStop} hexpand>
                <box spacing={8} halign={Gtk.Align.CENTER}>
                  <LucideIcon name="circle-stop" pixelSize={18} />
                  <label label="Stop Recording" css="font-weight: 700; font-size: 0.9em;" />
                </box>
              </button>
            </box>
          ) as Gtk.Box;

          self.add_named(idleBox, 'idle');
          self.add_named(recordingBox, 'recording');

          const update = () => self.set_visible_child_name(isRecording() ? 'recording' : 'idle');
          update();
          const dispose = isRecording.subscribe(update);
          self.connect('destroy', () => dispose());
        }}
      />
    </box>
  );
}
