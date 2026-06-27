import { Gdk } from "ags/gtk4"
import Wp from "gi://AstalWp"
import { createBinding as bind } from "ags"
import { LucideIcon } from "../../lib/lucide"
import app from "ags/gtk4/app"

export default function Volume({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const speaker = Wp.get_default()!.audio.default_speaker!

  if (!speaker) return <box />

  const volIcon = bind(speaker, "volume_icon").as(icon => {
    if (icon.includes("muted")) return "volume-x"
    if (icon.includes("high")) return "volume-2"
    if (icon.includes("medium")) return "volume-1"
    if (icon.includes("low")) return "volume"
    return "volume-x"
  })

  return (
    <button class="Volume" onClicked={() => app.toggle_window(`control-center-${gdkmonitor.get_connector()}`)}>
      <box spacing={4}>
        <LucideIcon name={volIcon} class="icon" />
      </box>
    </button>
  )
}
