import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import GLib from 'gi://GLib';
import Cairo from 'gi://cairo';

import BarReserve from './BarReserve';
import PanelBackground, { forceRedrawBar } from './PanelBackground';
import Clock from './widget/Clock';
import RecordIndicator from './widget/RecordIndicator';
import ScrollerIndicator from './widget/ScrollerIndicator';
import SysMetrics from './widget/SysMetrics';
import Tray from './widget/Tray';
import Updates from './widget/Updates';
import Volume from './widget/Volume';
import Weather from './widget/Weather';
import Workspaces from './widget/Workspaces';

export { forceRedrawBar };

const BORDER_WIDTH = 3;
const BAR_WIDTH = 47;

export default function Bar(gdkmonitor: Gdk.Monitor) {
  BarReserve(gdkmonitor);

  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  return (
    <window
      visible
      name={`bar-${gdkmonitor.get_connector()}`}
      cssClasses={['Bar']}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
      $={(self) => {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
          const surf = self.get_native()?.get_surface();
          if (surf) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Region = (Cairo as any).Region;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const RectangleInt = (Cairo as any).RectangleInt;
            const region = new Region();
            region.unionRectangle(
              new RectangleInt({ x: 0, y: 0, width: BAR_WIDTH + BORDER_WIDTH, height: 9999 }),
            );
            surf.set_input_region(region);
          }
          return GLib.SOURCE_REMOVE;
        });
      }}
    >
      <overlay
        hexpand
        vexpand
        $={(overlay) => {
          overlay.add_overlay(
            (
              <box halign={Gtk.Align.START}>
                <centerbox
                  class="panel"
                  orientation={Gtk.Orientation.VERTICAL}
                  startWidget={
                    (
                      <box
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.START}
                        class="panel-start"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={24}
                      >
                        <Workspaces gdkmonitor={gdkmonitor} />
                        <ScrollerIndicator gdkmonitor={gdkmonitor} />
                      </box>
                    ) as Gtk.Widget
                  }
                  centerWidget={
                    (
                      <box
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.CENTER}
                        class="panel-center"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={8}
                      >
                        <Weather gdkmonitor={gdkmonitor} />
                        <Clock gdkmonitor={gdkmonitor} />
                      </box>
                    ) as Gtk.Widget
                  }
                  endWidget={
                    (
                      <box
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.END}
                        class="panel-end"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={8}
                      >
                        <RecordIndicator />
                        <Updates gdkmonitor={gdkmonitor} />
                        <SysMetrics gdkmonitor={gdkmonitor} />
                        <Volume gdkmonitor={gdkmonitor} />
                        <Tray />
                      </box>
                    ) as Gtk.Widget
                  }
                />
              </box>
            ) as Gtk.Widget,
          );
        }}
      >
        <PanelBackground gdkmonitor={gdkmonitor} />
      </overlay>
    </window>
  );
}
