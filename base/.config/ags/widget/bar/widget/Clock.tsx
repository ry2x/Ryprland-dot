import { Gdk } from 'ags/gtk4';
import { Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import { clockTime, shortDate, shortDay } from '../../../services/time';

export default function Clock({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const toggleMenu = () => {
    const ccName = `control-center-${gdkmonitor.get_connector()}`;
    const dwName = `date-weather-popup-${gdkmonitor.get_connector()}`;
    const cc = app.get_window(ccName);
    const dw = app.get_window(dwName);

    if (dw && dw.get_visible()) {
      dw.set_visible(false);
    } else {
      if (cc && cc.get_visible()) cc.set_visible(false);
      if (dw) dw.set_visible(true);
    }
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
