import { createState } from 'ags';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import { activeSidePanel, animDx } from '../../services/windowManager';
import ClockCard from './widget/ClockCard';
import NotificationList from './widget/NotificationList';
import ProfileCard from './widget/ProfileCard';
import WeatherCard from './widget/WeatherCard';
import WorldClockCard from './widget/WorldClockCard';

interface ClickCatcherProps {
  onClick: () => void;
  hexpand?: boolean;
  vexpand?: boolean;
  heightRequest?: number;
  widthRequest?: number;
}

function ClickCatcher({
  onClick,
  hexpand = false,
  vexpand = false,
  heightRequest = -1,
  widthRequest = -1,
}: ClickCatcherProps) {
  const box = (
    <box
      class="click-catcher"
      hexpand={hexpand}
      vexpand={vexpand}
      heightRequest={heightRequest}
      widthRequest={widthRequest}
    />
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

  let hideTimeout: ReturnType<typeof setTimeout> | null = null;

  const hide_animated = () => {
    setIsRevealed(false);
    activeSidePanel.set('', '');
    const w = app.get_window(windowName);
    if (hideTimeout !== null) {
      clearTimeout(hideTimeout);
    }
    hideTimeout = setTimeout(() => {
      if (w) w.set_visible(false);
      hideTimeout = null;
    }, 800);
  };

  const show_animated = () => {
    if (hideTimeout !== null) {
      clearTimeout(hideTimeout);
      hideTimeout = null;
    }
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
      marginLeft={47}
      marginTop={0}
      keymode={Astal.Keymode.NONE}
      application={app}
      visible={false}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box orientation={Gtk.Orientation.HORIZONTAL} vexpand={true}>
          {(() => {
            const rev = (
              <revealer
                transitionType={Gtk.RevealerTransitionType.CROSSFADE}
                transitionDuration={800}
                revealChild={isRevealed}
              >
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  {(() => {
                    const container = (
                      <box
                        cssClasses={isRevealed.as((r) =>
                          r ? ['dw-container', 'revealed'] : ['dw-container'],
                        )}
                        css={animDx((dx) => {
                          const ml = dx - 947;
                          const op = Math.max(0, Math.min(1, (dx - 47) / 900));
                          return `transform: translateX(${ml < -900 ? -900 : ml}px); opacity: ${op};`;
                        })}
                        spacing={24}
                      >
                        {/* LEFT COLUMN: Weather & Calendar */}
                        <box
                          orientation={Gtk.Orientation.VERTICAL}
                          spacing={16}
                          class="left-column"
                        >
                          <ClockCard />
                          <WorldClockCard />
                          <WeatherCard />
                          <box class="calendar-card widget-card" halign={Gtk.Align.FILL}>
                            {Object.assign(new Gtk.Calendar(), {
                              halign: Gtk.Align.CENTER,
                              hexpand: true,
                            })}
                          </box>
                          <ProfileCard />
                        </box>

                        {/* Separator between columns */}
                        <box class="vertical-sep" />

                        {/* RIGHT COLUMN: Notifications */}
                        <NotificationList />
                      </box>
                    ) as Gtk.Box;

                    container.set_hexpand(false);
                    container.set_hexpand_set(true);
                    container.set_vexpand(true);
                    container.set_valign(Gtk.Align.FILL);
                    container.set_halign(Gtk.Align.START);

                    return container;
                  })()}
                </box>
              </revealer>
            ) as Gtk.Widget;

            rev.set_hexpand(false);
            rev.set_hexpand_set(true);
            rev.set_vexpand(false);
            rev.set_vexpand_set(true);

            return rev;
          })()}

          <ClickCatcher onClick={hide_animated} hexpand={true} />
        </box>
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
