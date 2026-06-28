import { Gdk } from "ags/gtk4"
import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { LucideIcon } from "../../lib/lucide"
import app from "ags/gtk4/app"

// Location for weather (e.g., "Tokyo", "Osaka", "New+York").
// Leave empty "" to auto-detect based on your IP address.
const LOCATION = "Osaka"

// Fetch full JSON for future forecast usage (every 30 mins, timeout 10s)
const weatherJson = createPoll(
  "{}",
  60000 * 30,
  `curl -s --max-time 10 'wttr.in/${LOCATION}?format=j1'`,
)

// WMO weather code mapping to Lucide icons
function getWeatherIcon(code: string) {
  const c = parseInt(code)
  if (isNaN(c)) return "cloud"

  switch (c) {
    case 113:
      return "sun"
    case 116:
      return "cloud-sun"
    case 119:
    case 122:
      return "cloud"
    case 143:
    case 248:
    case 260:
      return "cloud-fog"
    case 176:
    case 263:
    case 266:
    case 293:
    case 296:
    case 299:
    case 302:
    case 305:
    case 308:
      return "cloud-rain"
    case 200:
    case 386:
    case 389:
    case 392:
    case 395:
      return "cloud-lightning"
    case 227:
    case 230:
    case 320:
    case 323:
    case 326:
    case 329:
    case 332:
    case 335:
    case 338:
      return "snowflake"
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
      return "cloud-snow"
    case 353:
    case 356:
    case 359:
      return "cloud-drizzle"
    default:
      return "cloud"
  }
}

export default function Weather({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const weather = weatherJson.as((str) => {
    try {
      const data = JSON.parse(str)
      if (!data.current_condition || data.current_condition.length === 0)
        return null

      const current = data.current_condition[0]
      return {
        temp: current.temp_C,
        code: current.weatherCode,
      }
    } catch {
      return null
    }
  })

  const toggleMenu = () => {
    const ccName = `control-center-${gdkmonitor.get_connector()}`
    const dwName = `date-weather-popup-${gdkmonitor.get_connector()}`
    const cc = app.get_window(ccName)
    const dw = app.get_window(dwName)

    if (dw && dw.get_visible()) {
      dw.set_visible(false)
    } else {
      if (cc && cc.get_visible()) cc.set_visible(false)
      if (dw) dw.set_visible(true)
    }
  }

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={weather.as((w) => w !== null)}
    >
      <box>
        <button class="Weather" onClicked={toggleMenu}>
          <box spacing={4}>
            <LucideIcon
              name={weather.as((w) => (w ? getWeatherIcon(w.code) : "cloud"))}
              class="icon"
            />
            <label label={weather.as((w) => (w ? `${w.temp}°C` : ""))} />
          </box>
        </button>
        <box class="sep" />
      </box>
    </revealer>
  )
}
