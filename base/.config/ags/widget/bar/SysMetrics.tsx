import { Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { LucideIcon } from "../../lib/lucide"
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
      "free -m | grep Mem | awk '{printf \"%.1fGB\", $3/1024}'",
    ])
      .then((out) => out)
      .catch(() => "0%"),
  )

  const gpu = createPoll("0%", 2000, () =>
    execAsync([
      "bash",
      "-c",
      "cat /sys/class/drm/card*/device/gpu_busy_percent 2>/dev/null | sort -nr | head -n 1 | awk '{print $1\"%\"}'",
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
        <box spacing={4}>
          <LucideIcon name="gpu" class="icon" />
          <label label={gpu} />
        </box>
      </box>
    </button>
  )
}
