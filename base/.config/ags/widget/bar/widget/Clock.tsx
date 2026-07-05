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
      <box spacing={6} valign={Gtk.Align.CENTER}>
        <label class="date" label={shortDate} valign={Gtk.Align.CENTER} />
        <label
          class="day"
          label={shortDay}
          valign={Gtk.Align.CENTER}
          css="font-size: 0.85em; color: alpha(currentColor, 0.7); font-weight: 600; text-transform: uppercase;"
        />
        <label class="time" label={clockTime} valign={Gtk.Align.START} />
      </box>
    </button>
  );
}
