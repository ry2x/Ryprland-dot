import { Gdk } from 'ags/gtk4';
import { Gtk } from 'ags/gtk4';

import { LucideIcon } from '../../../lib/lucide';
import { getWeatherIcon, weatherInfo } from '../../../services/weather';
import { toggleDateWeather } from '../../../services/windowManager';

export default function Weather({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={weatherInfo.as((w) => w !== null)}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <button class="Weather" onClicked={() => toggleDateWeather(gdkmonitor.get_connector())}>
          <box spacing={0} orientation={Gtk.Orientation.VERTICAL}>
            <LucideIcon
              name={weatherInfo.as((w) => (w ? getWeatherIcon(w.code) : 'cloud'))}
              class="icon"
              css="margin-bottom: 4px;"
            />
            <label label={weatherInfo.as((w) => (w ? `${w.temp}` : ''))} css="font-weight: 800;" />
            <label
              label={weatherInfo.as((w) => (w ? '°C' : ''))}
              css="font-size: 0.85em; font-weight: 800;"
            />
          </box>
        </button>
      </box>
    </revealer>
  );
}
