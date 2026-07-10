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
  const { TOP, BOTTOM, LEFT } = Astal.WindowAnchor;

  return (
    <window
      visible
      name={`bar-${gdkmonitor.get_connector()}`}
      cssClasses={["Bar"]}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.TOP}
      anchor={TOP | BOTTOM | LEFT}
      application={app}
    >
      <centerbox
        class="panel"
        orientation={Gtk.Orientation.VERTICAL}
        startWidget={
          (<box halign={Gtk.Align.FILL} valign={Gtk.Align.START} class="panel-start" orientation={Gtk.Orientation.VERTICAL} spacing={24}>
            <Workspaces gdkmonitor={gdkmonitor} />
            <ScrollerIndicator gdkmonitor={gdkmonitor} />
          </box>) as Gtk.Widget
        }
        centerWidget={
          (<box halign={Gtk.Align.FILL} valign={Gtk.Align.CENTER} class="panel-center" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <Weather gdkmonitor={gdkmonitor} />
            <Clock gdkmonitor={gdkmonitor} />
          </box>) as Gtk.Widget
        }
        endWidget={
          (<box halign={Gtk.Align.FILL} valign={Gtk.Align.END} class="panel-end" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
            <Updates gdkmonitor={gdkmonitor} />
            <SysMetrics gdkmonitor={gdkmonitor} />
            <Volume gdkmonitor={gdkmonitor} />
            <Tray />
          </box>) as Gtk.Widget
        }
      />
    </window>
  );
}
