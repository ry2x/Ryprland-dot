import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Notifd from "gi://AstalNotifd"
import Hyprland from "gi://AstalHyprland"
import { For, createState } from "ags"
import NotificationCard from "./NotificationCard"

const TIMEOUT_MS = 5000

export default function NotificationPopups(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor
  const connector = gdkmonitor.get_connector()

  const [popups, setPopups] = createState<Notifd.Notification[]>([])
  const timeouts = new Map<number, ReturnType<typeof setTimeout>>()
  const notifd = Notifd.get_default()
  const hypr = Hyprland.get_default()

  const dismissPopup = (id: number) => {
    const currentPopups = popups.get()
    const n = currentPopups.find((p) => p.id === id)

    if (timeouts.has(id)) {
      clearTimeout(timeouts.get(id)!)
      timeouts.delete(id)
    }
    setPopups(currentPopups.filter((p) => p.id !== id))

    // Clean up transient notifications from daemon memory once they expire from popups
    if (n && n.transient) {
      n.dismiss()
    }
  }

  notifd.connect("notified", (_, id) => {
    if (notifd.dont_disturb) return

    // Only show on the focused monitor
    if (hypr.get_focused_monitor().name !== connector) return

    const n = notifd.get_notification(id)
    if (n) {
      const current = popups.get()
      if (!current.some((p) => p.id === id)) {
        setPopups([n, ...current])
      }

      if (timeouts.has(id)) {
        clearTimeout(timeouts.get(id)!)
      }
      timeouts.set(
        id,
        setTimeout(() => dismissPopup(id), TIMEOUT_MS),
      )
    }
  })

  notifd.connect("resolved", (_, id) => {
    dismissPopup(id)
  })

  return (
    <window
      name={`notification-popups-${connector}`}
      class="NotificationPopups"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      anchor={TOP | RIGHT}
      marginTop={12}
      marginRight={12}
      layer={Astal.Layer.TOP}
      application={app}
      visible={popups.as((p) => p.length > 0)}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={8}
        valign={Gtk.Align.START}
      >
        <For each={popups}>
          {(notif) => <NotificationCard notif={notif as Notifd.Notification} />}
        </For>
      </box>
    </window>
  )
}
