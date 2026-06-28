import { Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { LucideIcon } from "../../lib/lucide"
import { Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"

export default function SysMetrics({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor
}) {
  const cpu = createPoll("0%", 2000, () =>
    execAsync([
      "bash",
      "-c",
      "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}' | awk '{printf \"%.0f%%\", $1}'",
    ])
      .then((out) => out)
      .catch(() => "0%"),
  )

  const ram = createPoll("0%", 2000, () =>
    execAsync([
      "bash",
      "-c",
      "free | grep Mem | awk '{printf \"%.0f%%\", $3/$2 * 100.0}'",
    ])
      .then((out) => out)
      .catch(() => "0%"),
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
    <button class="SysMetrics" onClicked={toggleMenu}>
      <box spacing={8}>
        <box spacing={4}>
          <LucideIcon name="cpu" class="icon" />
          <label label={cpu} />
        </box>
        <box spacing={4}>
          <LucideIcon name="memory-stick" class="icon" />
          <label label={ram} />
        </box>
      </box>
    </button>
  )
}
