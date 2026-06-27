import { Gdk } from "ags/gtk4"
import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import { LucideIcon } from "../../lib/lucide"
import app from "ags/gtk4/app"

export default function Updates({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  // Check for updates (official and AUR) every 30 minutes
  const updates = createPoll("0", 60000 * 30, "bash -c '(checkupdates 2>/dev/null; paru -Qu 2>/dev/null) | wc -l'")

  const isVisible = updates.as(u => parseInt(u) > 0)

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={isVisible}
    >
      <box>
        <button
          class="Updates"
          onClicked={() => app.toggle_window(`control-center-${gdkmonitor.get_connector()}`)}
        >
          <box spacing={4}>
            <LucideIcon name="package" class="icon" />
            <label label={updates} />
          </box>
        </button>
        <box class="sep" />
      </box>
    </revealer>
  )
}
