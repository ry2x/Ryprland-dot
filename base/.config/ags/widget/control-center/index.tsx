import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import { LucideIcon } from '../../lib/lucide';
import MediaCard from './widget/MediaCard';
import QuickToggles from './widget/QuickToggles';
import SystemMetrics from './widget/SystemMetrics';
import UpdatesCard from './widget/UpdatesCard';
import VolumeSlider from './widget/VolumeSlider';

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

export default function ControlCenter(gdkmonitor: Gdk.Monitor) {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  const win = (
    <window
      name={`control-center-${gdkmonitor.get_connector()}`}
      class="ControlCenter"
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

          <box
            class="cc-container"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={16}
            widthRequest={420}
            halign={Gtk.Align.CENTER}
            valign={Gtk.Align.START}
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
