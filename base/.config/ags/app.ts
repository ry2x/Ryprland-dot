import app from "ags/gtk4/app"
import { Gtk, Gdk } from "ags/gtk4"
import GLib from "gi://GLib"
import { execAsync } from "ags/process"
import style from "./style.scss"
import Bar from "./widget/Bar"
import ControlCenter from "./widget/ControlCenter"
import DateWeatherPopup from "./widget/DateWeatherPopup"

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
    })
  },
})
