import { Gdk, Gtk } from "ags/gtk4"
import Wp from "gi://AstalWp"
import { createBinding as bind } from "ags"
import { execAsync } from "ags/process"
import { LucideIcon } from "../../lib/lucide"
import app from "ags/gtk4/app"

export default function Volume({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const speaker = Wp.get_default()!.audio.default_speaker!

  if (!speaker) return <box />

  const volIcon = bind(speaker, "volume_icon").as((icon) => {
    if (icon.includes("muted")) return "volume-x"
    if (icon.includes("high")) return "volume-2"
    if (icon.includes("medium")) return "volume-1"
    if (icon.includes("low")) return "volume"
    return "volume-x"
  })

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

  const btn = (
    <button class="Volume" onClicked={toggleMenu}>
      <box spacing={4}>
        <LucideIcon name={volIcon} class="icon" />
        <label
          label={bind(speaker, "volume").as((v) => `${Math.round(v * 100)}%`)}
        />
      </box>
    </button>
  ) as Gtk.Button

  let lastPlay = 0
  const playSound = () => {
    const now = Date.now()
    if (now - lastPlay > 100) {
      lastPlay = now
      execAsync([
        "pw-play",
        "/usr/share/sounds/freedesktop/stereo/audio-volume-change.oga",
      ]).catch(() => {})
    }
  }

  const scroll = new Gtk.EventControllerScroll({
    flags: Gtk.EventControllerScrollFlags.VERTICAL,
  })
  scroll.connect("scroll", (_, dx, dy) => {
    if (dy > 0) {
      speaker.volume = Math.max(0, speaker.volume - 0.05)
      playSound()
    } else if (dy < 0) {
      speaker.volume = Math.min(1, speaker.volume + 0.05)
      playSound()
    }
    return true
  })
  btn.add_controller(scroll)

  return btn
}
