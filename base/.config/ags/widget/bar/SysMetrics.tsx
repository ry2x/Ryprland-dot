import { Gdk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { LucideIcon } from "../../lib/lucide"
import { Gtk } from "ags/gtk4"
import app from "ags/gtk4/app"

export default function SysMetrics({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  // Simplistic metric polling (mock logic; replace with real scripts or libgtop in production)
  const cpu = createPoll("0%", 2000, `bash -c "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}' | awk '{printf \"%.0f%%\", $1}'"`)
  const ram = createPoll("0%", 2000, `bash -c "free | grep Mem | awk '{printf \"%.0f%%\", $3/$2 * 100.0}'"`)

  return (
    <button class="SysMetrics" onClicked={() => app.toggle_window(`control-center-${gdkmonitor.get_connector()}`)}>
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
