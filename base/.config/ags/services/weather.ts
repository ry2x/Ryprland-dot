import { createState } from 'ags';
import { fetch } from 'ags/fetch';

import GLib from 'gi://GLib?version=2.0';

import { appConfig } from './config';

export const LOCATION = appConfig.weather.location;

export const [weatherJson, setWeatherJson] = createState('{}');

export function refreshWeather() {
  fetch(`https://wttr.in/${LOCATION}?format=j1`)
    .then((res) => {
      if (!res.ok) throw new Error(`Weather fetch failed: ${res.status}`);
      return res.text();
    })
    .then((out) => {
      if (!out || out.trim() === '') throw new Error('Empty weather response');
      JSON.parse(out);
      setWeatherJson(out);
    })
    .catch((err) => {
      console.error('Weather fetch failed:', err);
      GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000, () => {
        refreshWeather();
        return GLib.SOURCE_REMOVE;
      });
    });
}

refreshWeather();
GLib.timeout_add(GLib.PRIORITY_DEFAULT, 60000 * 30, () => {
  refreshWeather();
  return GLib.SOURCE_CONTINUE;
});

// eslint-disable-next-line complexity
export function getWeatherIcon(code: string) {
  const c = parseInt(code);
  if (isNaN(c)) return 'cloud';

  switch (c) {
    case 113:
      return 'sun';
    case 116:
      return 'cloud-sun';
    case 119:
    case 122:
      return 'cloud';
    case 143:
    case 248:
    case 260:
      return 'cloud-fog';
    case 176:
    case 263:
    case 266:
    case 293:
    case 296:
    case 299:
    case 302:
    case 305:
    case 308:
      return 'cloud-rain';
    case 200:
    case 386:
    case 389:
    case 392:
    case 395:
      return 'cloud-lightning';
    case 227:
    case 230:
    case 320:
    case 323:
    case 326:
    case 329:
    case 332:
    case 335:
    case 338:
      return 'snowflake';
    case 179:
    case 182:
    case 185:
    case 281:
    case 284:
    case 311:
    case 314:
    case 317:
    case 350:
    case 362:
    case 365:
    case 368:
    case 371:
    case 374:
    case 377:
      return 'cloud-snow';
    case 353:
    case 356:
    case 359:
      return 'cloud-drizzle';
    default:
      return 'cloud';
  }
}

export const weatherInfo = weatherJson.as((str) => {
  try {
    const data = JSON.parse(str);
    if (!data.current_condition || data.current_condition.length === 0) return null;

    const current = data.current_condition[0];
    const today = data.weather[0];
    const rawRegion = data.nearest_area?.[0]?.region?.[0]?.value || LOCATION;
    // eslint-disable-next-line no-control-regex
    const region = rawRegion.replace(/[\u0000-\u001F\u007F-\u009F]/g, '');

    return {
      temp: current.temp_C,
      feelsLike: current.FeelsLikeC,
      desc: current.weatherDesc[0].value,
      code: current.weatherCode,
      humidity: current.humidity,
      wind: current.windspeedKmph,
      region: region,
      todayMax: today.maxtempC,
      todayMin: today.mintempC,
      forecast: data.weather
        .slice(1, 3)
        .map(
          (w: {
            date: string;
            maxtempC: string;
            mintempC: string;
            hourly: { weatherCode: string }[];
          }) => ({
            date: w.date,
            max: w.maxtempC,
            min: w.mintempC,
            code: w.hourly[4].weatherCode,
          }),
        ),
    };
  } catch {
    return null;
  }
});
