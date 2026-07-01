import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Notifd from "gi://AstalNotifd"
import { For, createState } from "ags"
import { createPoll } from "ags/time"
import { LucideIcon } from "../lib/lucide"
import NotificationCard from "./NotificationCard"

// Location for weather
const LOCATION = "Osaka"

// Clock variables
const clockTime = createPoll("", 1000, "date '+%H:%M'")
const clockTz = createPoll("", 60000, "date '+%Z'")
const clockDate = createPoll("", 60000, "date '+%B %d, %Y'")
const clockDay = createPoll("", 60000, "env LC_TIME=en_US.UTF-8 date '+%A'")

const WORLD_CLOCKS = [
  { label: "London", tz: "Europe/London" },
  { label: "Brisbane", tz: "Australia/Brisbane" },
  { label: "New York", tz: "America/New_York" },
  { label: "Los Angeles", tz: "America/Los_Angeles" },
]

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

const weatherInfo = weatherJson.as((str) => {
  try {
    const data = JSON.parse(str)
    if (!data.current_condition || data.current_condition.length === 0)
      return null

    const current = data.current_condition[0]
    const today = data.weather[0]
    const region = data.nearest_area?.[0]?.region?.[0]?.value || LOCATION

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
            date: string
            maxtempC: string
            mintempC: string
            hourly: { weatherCode: string }[]
          }) => ({
            date: w.date,
            max: w.maxtempC,
            min: w.mintempC,
            code: w.hourly[4].weatherCode,
          }),
        ),
    }
  } catch {
    return null
  }
})

function AnimatedNotificationList() {
  const notifd = Notifd.get_default()
  const [notifs, setNotifs] = createState<Notifd.Notification[]>(
    notifd.get_notifications().filter((n) => !n.transient),
  )
  const [revealed, setRevealed] = createState<number[]>(
    notifs.peek().map((n) => n.id),
  )

  notifd.connect("notified", (_, id) => {
    const n = notifd.get_notification(id)
    if (n && !n.transient) {
      setNotifs([n, ...notifs.peek()])
      setTimeout(() => {
        setRevealed([...revealed.peek(), id])
      }, 10)
    }
  })

  notifd.connect("resolved", (_, id) => {
    setRevealed(revealed.peek().filter((rid) => rid !== id))
    setTimeout(() => {
      setNotifs(notifs.peek().filter((n) => n.id !== id))
    }, 300)
  })

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={12} class="notif-list">
      <For each={notifs}>
        {(notif) => {
          const n = notif as Notifd.Notification
          return (
            <revealer
              transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
              transitionDuration={300}
              revealChild={revealed.as((ids) => ids.includes(n.id))}
            >
              <revealer
                transitionType={Gtk.RevealerTransitionType.CROSSFADE}
                transitionDuration={300}
                revealChild={revealed.as((ids) => ids.includes(n.id))}
              >
                <NotificationCard notif={n} />
              </revealer>
            </revealer>
          )
        }}
      </For>
    </box>
  )
}

export default function DateWeatherPopup(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor
  const notifd = Notifd.get_default()

  return (
    <window
      name={`date-weather-popup-${gdkmonitor.get_connector()}`}
      class="DateWeatherPopup"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.TOP}
      anchor={TOP}
      marginTop={0}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <overlay>
        <button
          hexpand
          vexpand
          onClicked={(self) => {
            const win = self.get_root() as Gtk.Window
            if (win) win.set_visible(false)
          }}
          class="click-catcher"
        />
        <box valign={Gtk.Align.START} halign={Gtk.Align.CENTER} marginTop={0}>
          <box class="dw-container" spacing={24}>
            {/* LEFT COLUMN: Weather & Calendar */}
            <box
              orientation={Gtk.Orientation.VERTICAL}
              spacing={16}
              class="left-column"
            >
              {/* CLOCK CARD */}
              <box
                class="clock-card widget-card"
                orientation={Gtk.Orientation.VERTICAL}
                spacing={8}
                valign={Gtk.Align.CENTER}
                hexpand
              >
                <box halign={Gtk.Align.FILL} valign={Gtk.Align.CENTER}>
                  <box hexpand />
                  <label label={clockTime} class="clock-time" />
                  <box hexpand valign={Gtk.Align.END} halign={Gtk.Align.START}>
                    <label
                      label={clockTz}
                      class="clock-tz"
                      css="margin-left: 8px;"
                    />
                  </box>
                </box>
                <box spacing={8} halign={Gtk.Align.CENTER}>
                  <label label={clockDay} class="clock-day" />
                  <label label="•" class="clock-dot" />
                  <label label={clockDate} class="clock-date" />
                </box>
              </box>

              {/* WORLD CLOCK CARD */}
              <box
                class="world-clock-card widget-card"
                orientation={Gtk.Orientation.VERTICAL}
                spacing={8}
                hexpand
              >
                {WORLD_CLOCKS.map((tz) => (
                  <box
                    orientation={Gtk.Orientation.VERTICAL}
                    halign={Gtk.Align.FILL}
                    spacing={2}
                  >
                    <box
                      orientation={Gtk.Orientation.HORIZONTAL}
                      halign={Gtk.Align.FILL}
                    >
                      <label
                        label={tz.label}
                        halign={Gtk.Align.START}
                        hexpand
                        class="world-clock-label"
                      />
                      <label
                        halign={Gtk.Align.END}
                        css="font-weight: 700; font-size: 1.1em;"
                        label={clockTime.as(() => {
                          const now = new Date()
                          return now.toLocaleTimeString("en-US", {
                            timeZone: tz.tz,
                            hour: "2-digit",
                            minute: "2-digit",
                            hour12: false,
                          })
                        })}
                      />
                    </box>
                    <label
                      halign={Gtk.Align.START}
                      css="color: alpha(currentColor, 0.7); font-size: 0.85em;"
                      label={clockTime.as(() => {
                        const now = new Date()
                        const date = now.toLocaleDateString("en-US", {
                          timeZone: tz.tz,
                          month: "short",
                          day: "2-digit",
                        })
                        const parts = new Intl.DateTimeFormat("en-US", {
                          timeZone: tz.tz,
                          timeZoneName: "shortOffset",
                        }).formatToParts(now)
                        const offsetPart =
                          parts.find((p) => p.type === "timeZoneName")?.value ||
                          ""
                        let offset = offsetPart.replace("GMT", "")
                        if (offset === "") offset = "+0"
                        const tzAbbrParts = new Intl.DateTimeFormat("en-US", {
                          timeZone: tz.tz,
                          timeZoneName: "short",
                        }).formatToParts(now)
                        const tzAbbr =
                          tzAbbrParts.find((p) => p.type === "timeZoneName")
                            ?.value || ""
                        return `${date} | ${offset}h | ${tzAbbr}`
                      })}
                    />
                  </box>
                ))}
              </box>

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
                    name={weatherInfo.as((w) =>
                      w ? getWeatherIcon(w.code) : "cloud",
                    )}
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
                      label={weatherInfo.as((w) => (w ? `${w.temp}°C` : "--"))}
                      class="weather-temp"
                      halign={Gtk.Align.CENTER}
                    />
                    <label
                      label={weatherInfo.as((w) => (w ? w.desc : "Loading..."))}
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
                <box
                  spacing={24}
                  class="weather-info"
                  halign={Gtk.Align.CENTER}
                >
                  <box spacing={6}>
                    <LucideIcon
                      name="wind"
                      pixelSize={16}
                      class="weather-info-icon"
                    />
                    <label
                      label={weatherInfo.as((w) =>
                        w ? `${w.wind} km/h` : "--",
                      )}
                    />
                  </box>
                  <box spacing={6}>
                    <LucideIcon
                      name="droplets"
                      pixelSize={16}
                      class="weather-info-icon"
                    />
                    <label
                      label={weatherInfo.as((w) =>
                        w ? `${w.humidity}%` : "--",
                      )}
                    />
                  </box>
                </box>

                {/* 2-Day Forecast */}
                <box
                  orientation={Gtk.Orientation.HORIZONTAL}
                  spacing={16}
                  homogeneous
                  css="margin-top: 4px;"
                >
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
                                .toLocaleDateString("en-US", {
                                  weekday: "short",
                                })
                                .toUpperCase()
                            : "",
                        )}
                        class="forecast-day"
                        halign={Gtk.Align.START}
                      />
                      <LucideIcon
                        name={weatherInfo.as((w) =>
                          w && w.forecast[i]
                            ? getWeatherIcon(w.forecast[i].code)
                            : "cloud",
                        )}
                        pixelSize={24}
                        class="forecast-icon"
                      />
                      <box
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={2}
                        valign={Gtk.Align.CENTER}
                      >
                        <label
                          label={weatherInfo.as((w) =>
                            w && w.forecast[i] ? `${w.forecast[i].max}°C` : "",
                          )}
                          class="forecast-max"
                          halign={Gtk.Align.START}
                        />
                        <label
                          label={weatherInfo.as((w) =>
                            w && w.forecast[i] ? `${w.forecast[i].min}°C` : "",
                          )}
                          class="forecast-min"
                          halign={Gtk.Align.START}
                        />
                      </box>
                    </box>
                  ))}
                </box>
              </box>

              <box class="calendar-card widget-card" halign={Gtk.Align.FILL}>
                {/* GTK Calendar component */}
                {Object.assign(new Gtk.Calendar(), {
                  halign: Gtk.Align.CENTER,
                  hexpand: true,
                })}
              </box>
            </box>

            {/* Separator between columns */}
            <box class="vertical-sep" />

            {/* RIGHT COLUMN: Notifications */}
            <box
              orientation={Gtk.Orientation.VERTICAL}
              spacing={16}
              class="right-column"
            >
              <box class="notif-header" spacing={8}>
                <LucideIcon name="bell" pixelSize={20} />
                <label
                  label="Notifications"
                  class="dw-title"
                  halign={Gtk.Align.START}
                  hexpand
                />
                <button
                  class="clear-all-btn"
                  onClicked={() =>
                    notifd.get_notifications().forEach((n) => n.dismiss())
                  }
                >
                  <box spacing={6}>
                    <LucideIcon name="trash-2" pixelSize={14} />
                    <label
                      label="Clear All"
                      css="font-size: 0.8em; font-weight: 600;"
                    />
                  </box>
                </button>
              </box>

              {Object.assign(new Gtk.ScrolledWindow(), {
                cssClasses: ["notif-scroll"],
                vscrollbarPolicy: Gtk.PolicyType.AUTOMATIC,
                hscrollbarPolicy: Gtk.PolicyType.NEVER,
                vexpand: true,
                child: <AnimatedNotificationList />,
              })}
            </box>
          </box>
        </box>
      </overlay>
    </window>
  )
}
