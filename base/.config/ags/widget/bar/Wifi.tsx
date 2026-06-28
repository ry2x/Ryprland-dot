import { Gdk } from "ags/gtk4"
import Network from "gi://AstalNetwork"
import { createBinding as bind } from "ags"
import { LucideIcon } from "../../lib/lucide"
import App from "ags/gtk4/app"

export default function Wifi({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const network = Network.get_default()
  const wifi = network.wifi

  if (!wifi) return <box />

  const wifiIcon = bind(wifi, "icon_name").as((icon) => {
    if (icon.includes("excellent") || icon.includes("good")) return "wifi"
    if (icon.includes("ok")) return "wifi-high"
    if (icon.includes("weak")) return "wifi-low"
    if (icon.includes("none")) return "wifi-zero"
    return "wifi-off"
  })

  const toggleMenu = () => {
    const ccName = `control-center-${gdkmonitor.get_connector()}`
    const dwName = `date-weather-popup-${gdkmonitor.get_connector()}`
    const cc = App.get_window(ccName)
    const dw = App.get_window(dwName)

    if (cc && cc.get_visible()) {
      cc.set_visible(false)
    } else {
      if (dw && dw.get_visible()) dw.set_visible(false)
      if (cc) cc.set_visible(true)
    }
  }

  return (
    <button class="network-btn Wifi" onClicked={toggleMenu}>
      <box spacing={4}>
        <LucideIcon name={wifiIcon} class="icon" />
      </box>
    </button>
  )
}
