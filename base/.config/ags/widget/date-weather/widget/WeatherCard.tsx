import { Gtk } from 'ags/gtk4';

import { LucideIcon } from '../../../lib/lucide';
import { LOCATION, getWeatherIcon, weatherInfo } from '../../../services/weather';

export default function WeatherCard() {
  return (
    <box
      class="weather-card widget-card"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
      hexpand
      valign={Gtk.Align.CENTER}
    >
      {/* Current conditions */}
      <box spacing={16} halign={Gtk.Align.FILL}>
        <LucideIcon
          name={weatherInfo.as((w) => (w ? getWeatherIcon(w.code) : 'cloud'))}
          pixelSize={48}
          class="weather-icon"
          halign={Gtk.Align.START}
        />
        <box
          orientation={Gtk.Orientation.VERTICAL}
          valign={Gtk.Align.CENTER}
          hexpand
          halign={Gtk.Align.CENTER}
        >
          <label
            label={weatherInfo.as((w) => (w ? `${w.temp}°C` : '--'))}
            class="weather-temp"
            halign={Gtk.Align.CENTER}
          />
          <label
            label={weatherInfo.as((w) => (w ? w.desc : 'Loading...'))}
            class="weather-desc"
            halign={Gtk.Align.CENTER}
          />
        </box>
        <label
          label={weatherInfo.as((w) => (w ? w.region : LOCATION))}
          css="font-size: 1.1em; font-weight: 700; color: alpha(currentColor, 0.7);"
          halign={Gtk.Align.END}
          valign={Gtk.Align.CENTER}
        />
      </box>

      {/* Additional info */}
      <box spacing={24} class="weather-info" halign={Gtk.Align.CENTER}>
        <box spacing={6}>
          <LucideIcon name="wind" pixelSize={16} class="weather-info-icon" />
          <label label={weatherInfo.as((w) => (w ? `${w.wind} km/h` : '--'))} />
        </box>
        <box spacing={6}>
          <LucideIcon name="droplets" pixelSize={16} class="weather-info-icon" />
          <label label={weatherInfo.as((w) => (w ? `${w.humidity}%` : '--'))} />
        </box>
      </box>

      {/* 2-Day Forecast */}
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16} homogeneous css="margin-top: 4px;">
        {[0, 1].map((i) => (
          <box
            orientation={Gtk.Orientation.HORIZONTAL}
            spacing={12}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
          >
            <label
              label={weatherInfo.as((w) =>
                w && w.forecast[i]
                  ? new Date(w.forecast[i].date)
                      .toLocaleDateString('en-US', { weekday: 'short' })
                      .toUpperCase()
                  : '',
              )}
              class="forecast-day"
              halign={Gtk.Align.START}
            />
            <LucideIcon
              name={weatherInfo.as((w) =>
                w && w.forecast[i] ? getWeatherIcon(w.forecast[i].code) : 'cloud',
              )}
              pixelSize={24}
              class="forecast-icon"
            />
            <box orientation={Gtk.Orientation.VERTICAL} spacing={2} valign={Gtk.Align.CENTER}>
              <label
                label={weatherInfo.as((w) => (w && w.forecast[i] ? `${w.forecast[i].max}°C` : ''))}
                class="forecast-max"
                halign={Gtk.Align.START}
              />
              <label
                label={weatherInfo.as((w) => (w && w.forecast[i] ? `${w.forecast[i].min}°C` : ''))}
                class="forecast-min"
                halign={Gtk.Align.START}
              />
            </box>
          </box>
        ))}
      </box>
    </box>
  );
}
