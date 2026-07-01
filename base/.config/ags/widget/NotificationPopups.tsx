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
  const [revealed, setRevealed] = createState<number[]>([])
  const timeouts = new Map<number, ReturnType<typeof setTimeout>>()
  const notifd = Notifd.get_default()
  const hypr = Hyprland.get_default()

  const dismissPopup = (id: number) => {
    if (timeouts.has(id)) {
      clearTimeout(timeouts.get(id)!)
      timeouts.delete(id)
    }

    setRevealed(revealed.peek().filter((rid) => rid !== id))

    setTimeout(() => {
      const currentPopups = popups.peek()
      const n = currentPopups.find((p) => p.id === id)
      if (!n) return
      setPopups(currentPopups.filter((p) => p.id !== id))

      // Clean up transient notifications from daemon memory once they expire from popups
      if (n.transient) {
        n.dismiss()
      }
    }, 300)
  }

  notifd.connect("notified", (_, id) => {
    if (notifd.dont_disturb) return

    // Only show on the focused monitor
    if (hypr.get_focused_monitor().name !== connector) return

    const n = notifd.get_notification(id)
    if (n) {
      const current = popups.peek()
      if (!current.some((p) => p.id === id)) {
        setPopups([n, ...current])
        setTimeout(() => {
          setRevealed([...revealed.peek(), id])
        }, 10)
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
          {(notif) => {
            const n = notif as Notifd.Notification
            return (
              <revealer
                transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
                transitionDuration={300}
                revealChild={revealed.as((ids) => ids.includes(n.id))}
              >
                <revealer
                  transitionType={Gtk.RevealerTransitionType.CROSSFADE}
                  transitionDuration={300}
                  revealChild={revealed.as((ids) => ids.includes(n.id))}
                >
                  <box halign={Gtk.Align.END}>
                    <NotificationCard notif={n} />
                  </box>
                </revealer>
              </revealer>
            )
          }}
        </For>
      </box>
    </window>
  )
}
