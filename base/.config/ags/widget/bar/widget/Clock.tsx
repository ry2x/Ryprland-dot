import { Gdk } from 'ags/gtk4';
import { Gtk } from 'ags/gtk4';

import { clockTime, shortDate, shortDay } from '../../../services/time';
import { toggleDateWeather } from '../../../services/windowManager';

export default function Clock({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const toggleMenu = () => {
    toggleDateWeather(gdkmonitor.get_connector());
  };

  return (
    <button class="Clock" onClicked={toggleMenu}>
      <box spacing={0} orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
        <box marginTop={20} marginBottom={20} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
          <label
            class="date"
            label={shortDate}
            valign={Gtk.Align.CENTER}
            css="transform: rotate(90deg); margin: 0 -18px; font-size: 1.1em; font-weight: 700;"
          />
        </box>

        <box marginTop={14} marginBottom={14} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
          <label
            class="day"
            label={shortDay}
            valign={Gtk.Align.CENTER}
            css="transform: rotate(90deg); margin: 0 -12px; font-size: 0.95em; color: alpha(currentColor, 0.7); font-weight: 600; text-transform: uppercase;"
          />
        </box>

        <box marginTop={22} marginBottom={22} halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
          <label
            class="time"
            label={clockTime}
            valign={Gtk.Align.CENTER}
            css="transform: rotate(90deg); margin: 0 -22px; font-size: 1.2em; font-weight: 800;"
          />
        </box>
      </box>
    </button>
  );
}
