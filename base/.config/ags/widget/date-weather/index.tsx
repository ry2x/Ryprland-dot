import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import ClockCard from './widget/ClockCard';
import NotificationList from './widget/NotificationList';
import WeatherCard from './widget/WeatherCard';
import WorldClockCard from './widget/WorldClockCard';

interface ClickCatcherProps {
  onClick: () => void;
  hexpand?: boolean;
  vexpand?: boolean;
  heightRequest?: number;
}

function ClickCatcher({
  onClick,
  hexpand = false,
  vexpand = false,
  heightRequest = -1,
}: ClickCatcherProps) {
  const box = (
    <box class="click-catcher" hexpand={hexpand} vexpand={vexpand} heightRequest={heightRequest} />
  ) as Gtk.Box;
  const gesture = new Gtk.GestureClick();
  gesture.connect('pressed', onClick);
  box.add_controller(gesture);
  return box;
}

export default function DateWeatherPopup(gdkmonitor: Gdk.Monitor) {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const win = (
    <window
      name={`date-weather-popup-${gdkmonitor.get_connector()}`}
      class="DateWeatherPopup"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      marginTop={0}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <ClickCatcher onClick={() => win.set_visible(false)} hexpand={true} heightRequest={40} />

        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <ClickCatcher onClick={() => win.set_visible(false)} hexpand={true} />

          <box class="dw-container" spacing={24} halign={Gtk.Align.CENTER} valign={Gtk.Align.START}>
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

          <ClickCatcher onClick={() => win.set_visible(false)} hexpand={true} />
        </box>

        <ClickCatcher onClick={() => win.set_visible(false)} hexpand={true} vexpand={true} />
      </box>
    </window>
  ) as Astal.Window;

  const keyCtrl = new Gtk.EventControllerKey();
  keyCtrl.connect('key-pressed', (_, keyval) => {
    if (keyval === Gdk.KEY_Escape) {
      win.set_visible(false);
      return true;
    }
    return false;
  });
  win.add_controller(keyCtrl);

  return win;
}
