import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import { LucideIcon } from '../../lib/lucide';
import MediaCard from './widget/MediaCard';
import QuickToggles from './widget/QuickToggles';
import SystemMetrics from './widget/SystemMetrics';
import UpdatesCard from './widget/UpdatesCard';
import VolumeSlider from './widget/VolumeSlider';

export default function ControlCenter(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor;

  return (
    <window
      name={`control-center-${gdkmonitor.get_connector()}`}
      class="ControlCenter"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.TOP}
      anchor={TOP}
      marginTop={0}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <box
        class="cc-container"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={16}
        widthRequest={420}
      >
        <box spacing={12} halign={Gtk.Align.START}>
          <LucideIcon name="settings-2" pixelSize={24} />
          <label label="Control Center" class="cc-title" />
        </box>

        <QuickToggles />
        <VolumeSlider />
        <MediaCard />

        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16}>
          <SystemMetrics />
        </box>

        <UpdatesCard />
      </box>
    </window>
  );
}
