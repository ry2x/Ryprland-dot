import { createState } from 'ags';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import { LucideIcon } from '../../lib/lucide';
import MediaCard from './widget/MediaCard';
import QuickToggles from './widget/QuickToggles';
import SystemMetrics from './widget/SystemMetrics';
import UpdatesCard from './widget/UpdatesCard';
import VolumeSlider from './widget/VolumeSlider';
import { activeSidePanel, animDx } from '../../services/windowManager';

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
    <box class="click-catcher" hexpand={hexpand} vexpand={vexpand} heightRequest={heightRequest} widthRequest={widthRequest} />
  ) as Gtk.Box;
  const gesture = new Gtk.GestureClick();
  gesture.connect('pressed', onClick);
  box.add_controller(gesture);
  return box;
}

export default function ControlCenter(gdkmonitor: Gdk.Monitor) {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const [isRevealed, setIsRevealed] = createState(false);

  const windowName = `control-center-${gdkmonitor.get_connector()}`;

  const hide_animated = () => {
    setIsRevealed(false);
    activeSidePanel.set("", "");
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
      class="ControlCenter"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      marginLeft={46}
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
                transitionDuration={300}
                revealChild={isRevealed}
              >
                <box orientation={Gtk.Orientation.HORIZONTAL}>
                  {(() => {
                    const container = (
                      <box
                        cssClasses={isRevealed.as(r => r ? ["cc-container", "revealed"] : ["cc-container"])}
                        css={animDx((dx) => {
                          const ml = dx - 536;
                          const op = Math.max(0, Math.min(1, (dx - 46) / 490));
                          return `margin-left: ${ml < -490 ? -490 : ml}px; opacity: ${op};`;
                        })}
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={16}
                        widthRequest={400}
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
