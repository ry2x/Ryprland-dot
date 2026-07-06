import { createState } from 'ags';
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

  const [isRevealed, setIsRevealed] = createState(false);

  const windowName = `date-weather-popup-${gdkmonitor.get_connector()}`;

  const hide_animated = () => {
    setIsRevealed(false);
    const w = app.get_window(windowName);
    setTimeout(() => {
      if (w) w.set_visible(false);
    }, 300);
  };

  const show_animated = () => {
    const w = app.get_window(windowName);
    if (w) w.set_visible(true);
    setIsRevealed(true);
  };

  const win = (
    <window
      name={windowName}
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
        <box orientation={Gtk.Orientation.HORIZONTAL}>
          <ClickCatcher onClick={hide_animated} hexpand={true} />

          <revealer
            transitionType={Gtk.RevealerTransitionType.SLIDE_DOWN}
            transitionDuration={300}
            revealChild={isRevealed}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.START}
          >
            <box orientation={Gtk.Orientation.VERTICAL}>
              <ClickCatcher onClick={hide_animated} hexpand={true} heightRequest={40} />
              <box
                class="dw-container"
                spacing={24}
                halign={Gtk.Align.CENTER}
                valign={Gtk.Align.START}
              >
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
          </revealer>

          <ClickCatcher onClick={hide_animated} hexpand={true} />
        </box>

        <ClickCatcher onClick={hide_animated} hexpand={true} vexpand={true} />
      </box>
    </window>
  ) as Astal.Window;

  Object.assign(win, { hide_animated, show_animated });

  const keyCtrl = new Gtk.EventControllerKey();
  keyCtrl.connect('key-pressed', (_, keyval) => {
    if (keyval === Gdk.KEY_Escape) {
      hide_animated();
      return true;
    }
    return false;
  });
  win.add_controller(keyCtrl);

  return win;
}
