import { Gdk } from "ags/gtk4"
import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { LucideIcon } from "../../lib/lucide"
import app from "ags/gtk4/app"

// Check for updates (official and AUR) every 30 minutes. Exported to share with ControlCenter.
export const updatesPoll = createPoll(
  "0",
  60000 * 30,
  "bash -c '(checkupdates 2>/dev/null; paru -Qu 2>/dev/null) | wc -l'",
)

export default function Updates({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const isVisible = updatesPoll.as((u) => parseInt(u) > 0)

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
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={isVisible}
    >
      <box>
        <button class="Updates" onClicked={toggleMenu}>
          <box spacing={4}>
            <LucideIcon name="package" class="icon" />
            <label label={updatesPoll} />
          </box>
        </button>
        <box class="sep" />
      </box>
    </revealer>
  )
}
