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

  return (
    <button class="network-btn Bluetooth" onClicked={() => app.toggle_window(`control-center-${gdkmonitor.get_connector()}`)}>
      <LucideIcon name={icon} />
    </button>
  )
}
