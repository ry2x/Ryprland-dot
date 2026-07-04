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
      <box>
        <button class="Weather" onClicked={() => toggleDateWeather(gdkmonitor.get_connector())}>
          <box spacing={4}>
            <LucideIcon
              name={weatherInfo.as((w) => (w ? getWeatherIcon(w.code) : 'cloud'))}
              class="icon"
            />
            <label label={weatherInfo.as((w) => (w ? `${w.temp}°C` : ''))} />
          </box>
        </button>
        <box class="sep" />
      </box>
    </revealer>
  );
}
