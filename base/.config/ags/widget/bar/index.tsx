import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import Clock from './widget/Clock';
import ScrollerIndicator from './widget/ScrollerIndicator';
import SysMetrics from './widget/SysMetrics';
import Tray from './widget/Tray';
import Updates from './widget/Updates';
import Volume from './widget/Volume';
import Weather from './widget/Weather';
import Workspaces from './widget/Workspaces';

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor;

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP}
      marginTop={2}
      marginBottom={2}
      application={app}
    >
      <box class="island" spacing={0} halign={Gtk.Align.CENTER}>
        <Workspaces gdkmonitor={gdkmonitor} />
        <box class="sep" />
        <ScrollerIndicator gdkmonitor={gdkmonitor} />
        <Weather gdkmonitor={gdkmonitor} />
        <Clock gdkmonitor={gdkmonitor} />
        <box class="sep" />
        <Updates gdkmonitor={gdkmonitor} />
        <SysMetrics gdkmonitor={gdkmonitor} />
        <box class="sep" />
        <Volume gdkmonitor={gdkmonitor} />
        <Tray />
      </box>
    </window>
  );
}
