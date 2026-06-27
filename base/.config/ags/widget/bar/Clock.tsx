import { Gdk } from "ags/gtk4"
import { Gtk } from "ags/gtk4"
import { createPoll } from "ags/time"
import app from "ags/gtk4/app"

export default function Clock({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const time = createPoll("", 1000, "date '+%H:%M'")
  const date = createPoll("", 60000, "date '+%m/%d'")
  const day = createPoll("", 60000, "env LC_TIME=en_US.UTF-8 date '+%a'")

  return (
    <button class="Clock" onClicked={() => app.toggle_window(`date-weather-popup-${gdkmonitor.get_connector()}`)}>
      <box spacing={6} valign={Gtk.Align.CENTER}>
        <label class="date" label={date} valign={Gtk.Align.CENTER} />
        <label class="day" label={day} valign={Gtk.Align.CENTER} css="font-size: 0.85em; color: alpha(currentColor, 0.7); font-weight: 600; text-transform: uppercase;" />
        <label class="time" label={time} valign={Gtk.Align.START} />
      </box>
    </button>
  )
}
