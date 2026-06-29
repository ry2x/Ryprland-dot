import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Notifd from "gi://AstalNotifd"
import { createBinding as bind, For } from "ags"
import { createPoll } from "ags/time"
import { LucideIcon } from "../lib/lucide"
import Pango from "gi://Pango"

// Location for weather
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

const weatherInfo = weatherJson.as((str) => {
  try {
    const data = JSON.parse(str)
    if (!data.current_condition || data.current_condition.length === 0)
      return null

    const current = data.current_condition[0]
    const today = data.weather[0]

    return {
      temp: current.temp_C,
      feelsLike: current.FeelsLikeC,
      desc: current.weatherDesc[0].value,
      code: current.weatherCode,
      humidity: current.humidity,
      wind: current.windspeedKmph,
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

function NotificationCard({ notif }: { notif: Notifd.Notification }) {
  const isPath =
    notif.app_icon &&
    (notif.app_icon.startsWith("/") || notif.app_icon.startsWith("file://"))

  const resolveImage = (img: string | null) => {
    if (!img) return null
    if (img.startsWith("file://")) return img
    if (img.startsWith("/")) return `file://${img}`
    return null
  }

  const appIcon = notif.app_icon || notif.desktop_entry || notif.image
  const appIconPath = resolveImage(appIcon)

  const imageToDisplay = resolveImage(notif.image)

  return (
    <box
      class={`notif-card urgency-${notif.urgency}`}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
    >
      <box spacing={12}>
        {/* ICON */}
        {appIconPath ? (
          <box
            css={`
              background-image: url("${appIconPath}");
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              min-width: 24px;
              min-height: 24px;
            `}
            valign={Gtk.Align.START}
          />
        ) : appIcon ? (
          <image
            iconName={appIcon}
            pixelSize={24}
            valign={Gtk.Align.START}
          />
        ) : (
          <LucideIcon
            name="message-square"
            pixelSize={24}
            valign={Gtk.Align.START}
          />
        )}

        {/* SUMMARY & APP NAME */}
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label
            label={notif.summary}
            class="notif-summary"
            xalign={0}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={24}
          />
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label
              label={notif.app_name ?? "Notify-send"}
              class="notif-app"
              xalign={0}
              ellipsize={Pango.EllipsizeMode.END}
              lines={1}
              maxWidthChars={18}
            />
            <box hexpand />
            <label
              label={new Date(notif.time * 1000).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
              class="notif-time"
              css="font-size: 0.75em; color: alpha(currentColor, 0.6); margin-right: 8px;"
            />
          </box>
        </box>

        {/* CLOSE BUTTON */}
        <button
          class="notif-close"
          onClicked={() => notif.dismiss()}
          valign={Gtk.Align.START}
        >
          <LucideIcon name="x" pixelSize={14} />
        </button>
      </box>

      {/* BODY & RICH IMAGE */}
      <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        {notif.body && (
          <label
            label={notif.body}
            class="notif-body"
            xalign={0}
            wrap
            wrapMode={Pango.WrapMode.WORD_CHAR}
            maxWidthChars={24}
          />
        )}

        {imageToDisplay && (
          <box
            css={`
              background-image: url("${imageToDisplay}");
              background-size: cover;
              background-position: center;
              border-radius: 8px;
              min-height: 140px;
              margin-top: 4px;
            `}
          />
        )}
      </box>

      {/* ACTIONS */}
      {notif.actions && notif.actions.length > 0 && (
        <box spacing={8} class="notif-actions" marginTop={8}>
          {notif.actions.map((action: { id: string; label: string }) => (
            <button
              class="notif-action-btn"
              hexpand
              onClicked={() => {
                notif.invoke(action.id)
                app.get_monitors().forEach((m) => {
                  const conn = m.get_connector()
                  const cc = app.get_window(`control-center-${conn}`)
                  const dw = app.get_window(`date-weather-popup-${conn}`)
                  if (cc) cc.set_visible(false)
                  if (dw) dw.set_visible(false)
                })
                // Do not call notif.dismiss() here!
                // DBus race condition causes a segfault if the object is freed while invoke is pending.
              }}
            >
              <label label={action.label} ellipsize={Pango.EllipsizeMode.END} />
            </button>
          ))}
        </box>
      )}
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
      anchor={TOP}
      marginTop={8}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <box class="dw-container" spacing={24}>
        {/* LEFT COLUMN: Weather & Calendar */}
        <box
          orientation={Gtk.Orientation.VERTICAL}
          spacing={16}
          class="left-column"
        >
          <box
            class="weather-card widget-card"
            orientation={Gtk.Orientation.VERTICAL}
            spacing={16}
            hexpand
          >
            {/* Current conditions */}
            <box spacing={16}>
              <LucideIcon
                name={weatherInfo.as((w) =>
                  w ? getWeatherIcon(w.code) : "cloud",
                )}
                pixelSize={48}
              />
              <box
                orientation={Gtk.Orientation.VERTICAL}
                valign={Gtk.Align.CENTER}
              >
                <label
                  label={weatherInfo.as((w) => (w ? `${w.temp}°C` : "--"))}
                  css="font-size: 2.2em; font-weight: 800;"
                  halign={Gtk.Align.START}
                />
                <label
                  label={weatherInfo.as((w) => (w ? w.desc : "Loading..."))}
                  css="font-size: 1.1em; color: alpha(currentColor, 0.7);"
                  halign={Gtk.Align.START}
                />
              </box>
            </box>

            {/* Additional info */}
            <box
              spacing={16}
              css="color: alpha(currentColor, 0.6); font-size: 0.9em;"
            >
              <label
                label={weatherInfo.as((w) =>
                  w ? `H:${w.todayMax}° L:${w.todayMin}°` : "",
                )}
              />
              <label
                label={weatherInfo.as((w) => (w ? `Hum: ${w.humidity}%` : ""))}
              />
              <label
                label={weatherInfo.as((w) => (w ? `Wind: ${w.wind}km/h` : ""))}
              />
            </box>

            <box class="vertical-sep" />

            {/* 2-Day Forecast */}
            <box
              orientation={Gtk.Orientation.HORIZONTAL}
              spacing={16}
              homogeneous
            >
              <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={4}
                halign={Gtk.Align.CENTER}
              >
                <label
                  label={weatherInfo.as((w) =>
                    w
                      ? new Date(w.forecast[0].date).toLocaleDateString(
                          "en-US",
                          { weekday: "short" },
                        )
                      : "",
                  )}
                  css="font-size: 0.9em; font-weight: 700;"
                />
                <LucideIcon
                  name={weatherInfo.as((w) =>
                    w ? getWeatherIcon(w.forecast[0].code) : "cloud",
                  )}
                  pixelSize={24}
                />
                <label
                  label={weatherInfo.as((w) =>
                    w ? `${w.forecast[0].max}° / ${w.forecast[0].min}°` : "",
                  )}
                  css="font-size: 0.8em; color: alpha(currentColor, 0.7);"
                />
              </box>
              <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={4}
                halign={Gtk.Align.CENTER}
              >
                <label
                  label={weatherInfo.as((w) =>
                    w && w.forecast[1]
                      ? new Date(w.forecast[1].date).toLocaleDateString(
                          "en-US",
                          { weekday: "short" },
                        )
                      : "",
                  )}
                  css="font-size: 0.9em; font-weight: 700;"
                />
                <LucideIcon
                  name={weatherInfo.as((w) =>
                    w && w.forecast[1]
                      ? getWeatherIcon(w.forecast[1].code)
                      : "cloud",
                  )}
                  pixelSize={24}
                />
                <label
                  label={weatherInfo.as((w) =>
                    w && w.forecast[1]
                      ? `${w.forecast[1].max}° / ${w.forecast[1].min}°`
                      : "",
                  )}
                  css="font-size: 0.8em; color: alpha(currentColor, 0.7);"
                />
              </box>
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
          <box class="notif-header">
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
            child: (
              <box
                orientation={Gtk.Orientation.VERTICAL}
                spacing={12}
                class="notif-list"
              >
                <For
                  each={bind(notifd, "notifications").as((n) =>
                    n.filter((notif) => !notif.transient),
                  )}
                >
                  {(notif) => <NotificationCard notif={notif as Notifd.Notification} />}
                </For>
              </box>
            ),
          })}
        </box>
      </box>
    </window>
  )
}
