import { Gdk } from "ags/gtk4"
import AstalBluetooth from "gi://AstalBluetooth"
import { createBinding as bind } from "ags"
import { LucideIcon } from "../../lib/lucide"
import app from "ags/gtk4/app"

export default function Bluetooth({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const bluetooth = AstalBluetooth.get_default()

  const icon = bind(bluetooth, "is_powered").as((powered) =>
    powered ? "bluetooth" : "bluetooth-off",
  )

  const toggleMenu = () => {
    const ccName = `control-center-${gdkmonitor.get_connector()}`
    const dwName = `date-weather-popup-${gdkmonitor.get_connector()}`
    const cc = app.get_window(ccName)
    const dw = app.get_window(dwName)

    if (cc && cc.get_visible()) {
      cc.set_visible(false)
    } else {
      if (dw && dw.get_visible()) dw.set_visible(false)
      if (cc) cc.set_visible(true)
    }
  }

  return (
    <button class="network-btn Bluetooth" onClicked={toggleMenu}>
      <LucideIcon name={icon} />
    </button>
  )
}
