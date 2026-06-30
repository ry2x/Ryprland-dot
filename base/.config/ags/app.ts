import app from "ags/gtk4/app"
import { Gtk, Gdk } from "ags/gtk4"
import GLib from "gi://GLib"
import { execAsync } from "ags/process"
import Hyprland from "gi://AstalHyprland"
import style from "./style.scss"
import Bar from "./widget/Bar"
import ControlCenter from "./widget/ControlCenter"
import DateWeatherPopup from "./widget/DateWeatherPopup"
import NotificationPopups from "./widget/NotificationPopups"

app.start({
  css: style,
  requestHandler(request, res) {
    if (request[0] === "reload-css") {
      const configDir = `${GLib.get_user_config_dir()}/ags`
      const scssPath = `${configDir}/style.scss`
      const cssPath = `/tmp/ags-style.css`

      execAsync(`sass ${scssPath} ${cssPath}`)
        .then(() => {
          app.reset_css()
          app.apply_css(cssPath)
          res("CSS Reloaded Successfully")
        })
        .catch((err) => res(`Error: ${err}`))
    } else if (request[0] === "toggle-notif") {
      const focusedMonitor = Hyprland.get_default().get_focused_monitor().name
      app.get_monitors().forEach((m) => {
        const dw = app.get_window(`date-weather-popup-${m.get_connector()}`)
        const cc = app.get_window(`control-center-${m.get_connector()}`)
        if (dw) {
          if (m.get_connector() === focusedMonitor) {
            if (dw.get_visible()) {
              dw.set_visible(false)
            } else {
              if (cc) cc.set_visible(false)
              dw.set_visible(true)
            }
          } else {
            dw.set_visible(false)
          }
        }
      })
      res("Toggled Notification Center")
    } else if (request[0] === "toggle-cc") {
      const focusedMonitor = Hyprland.get_default().get_focused_monitor().name
      app.get_monitors().forEach((m) => {
        const cc = app.get_window(`control-center-${m.get_connector()}`)
        const dw = app.get_window(`date-weather-popup-${m.get_connector()}`)
        if (cc) {
          if (m.get_connector() === focusedMonitor) {
            if (cc.get_visible()) {
              cc.set_visible(false)
            } else {
              if (dw) dw.set_visible(false)
              cc.set_visible(true)
            }
          } else {
            cc.set_visible(false)
          }
        }
      })
      res("Toggled Control Center")
    } else if (request[0] === "list-windows") {
      const focusedMonitor = Hyprland.get_default().get_focused_monitor().name
      const dw = app.get_window(`date-weather-popup-${focusedMonitor}`)
      res(
        `Focused: ${focusedMonitor} | dw visible: ${dw?.get_visible()} | Windows: ` +
          app
            .get_windows()
            .map((w) => w.name)
            .join(", "),
      )
    } else {
      res(`Unknown command: ${request.join(" ")}`)
    }
  },
  main() {
    // Add lucide symbolic icons to GTK Icon Theme search path
    const display = Gdk.Display.get_default()
    if (display) {
      Gtk.IconTheme.get_for_display(display).add_search_path(
        `${GLib.get_user_config_dir()}/ags/assets/icons`,
      )
    }

    app.get_monitors().map((m) => {
      Bar(m)
      ControlCenter(m)
      DateWeatherPopup(m)
      NotificationPopups(m)
    })
  },
})
