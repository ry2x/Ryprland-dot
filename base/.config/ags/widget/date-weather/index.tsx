import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import ClockCard from './widget/ClockCard';
import NotificationList from './widget/NotificationList';
import WeatherCard from './widget/WeatherCard';
import WorldClockCard from './widget/WorldClockCard';

export default function DateWeatherPopup(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor;

  return (
    <window
      name={`date-weather-popup-${gdkmonitor.get_connector()}`}
      class="DateWeatherPopup"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.TOP}
      anchor={TOP}
      marginTop={0}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <overlay>
        <button
          hexpand
          vexpand
          onClicked={(self) => {
            const win = self.get_root() as Gtk.Window;
            if (win) win.set_visible(false);
          }}
          class="click-catcher"
        />
        <box valign={Gtk.Align.START} halign={Gtk.Align.CENTER} marginTop={0}>
          <box class="dw-container" spacing={24}>
            {/* LEFT COLUMN: Weather & Calendar */}
            <box orientation={Gtk.Orientation.VERTICAL} spacing={16} class="left-column">
              <ClockCard />
              <WorldClockCard />
              <WeatherCard />
              <box class="calendar-card widget-card" halign={Gtk.Align.FILL}>
                {Object.assign(new Gtk.Calendar(), {
                  halign: Gtk.Align.CENTER,
                  hexpand: true,
                })}
              </box>
            </box>

            {/* Separator between columns */}
            <box class="vertical-sep" />

            {/* RIGHT COLUMN: Notifications */}
            <NotificationList />
          </box>
        </box>
      </overlay>
    </window>
  );
}
