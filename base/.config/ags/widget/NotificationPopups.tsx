import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Notifd from "gi://AstalNotifd"
import Hyprland from "gi://AstalHyprland"
import { For, createState } from "ags"
import Pango from "gi://Pango"
import { LucideIcon } from "../lib/lucide"

// Helper to resolve images
const resolveImage = (img: string | null) => {
  if (!img) return null
  if (img.startsWith("file://")) return img
  if (img.startsWith("/")) return `file://${img}`
  return null
}

const TIMEOUT_MS = 5000

function PopupCard({
  notif,
  onDismiss,
}: {
  notif: Notifd.Notification
  onDismiss: () => void
}) {
  const appIcon = notif.app_icon || notif.desktop_entry || notif.image
  const appIconPath = resolveImage(appIcon)

  const imageToDisplay = resolveImage(notif.image)

  return (
    <box
      class={`notif-card urgency-${notif.urgency}`}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
      widthRequest={420}
    >
      <box spacing={12}>
        {/* ICON */}
        {appIconPath ? (
          <box
            css={`
              background-image: url("${appIconPath}");
              background-size: contain;
              background-repeat: no-repeat;
              background-position: center;
              min-width: 24px;
              min-height: 24px;
            `}
            valign={Gtk.Align.START}
          />
        ) : appIcon ? (
          <image iconName={appIcon} pixelSize={24} valign={Gtk.Align.START} />
        ) : (
          <LucideIcon
            name="message-square"
            pixelSize={24}
            valign={Gtk.Align.START}
          />
        )}

        {/* SUMMARY & APP NAME */}
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          <label
            label={notif.summary}
            class="notif-summary"
            xalign={0}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={24}
          />
          <label
            label={notif.app_name ?? "Notify-send"}
            class="notif-app"
            xalign={0}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={24}
          />
        </box>

        {/* CLOSE BUTTON */}
        <button
          class="notif-close"
          onClicked={() => notif.dismiss()}
          valign={Gtk.Align.START}
        >
          <LucideIcon name="x" pixelSize={16} />
        </button>
      </box>

      {/* BODY & RICH IMAGE */}
      <box orientation={Gtk.Orientation.VERTICAL} spacing={8}>
        {notif.body && (
          <label
            label={notif.body}
            class="notif-body"
            xalign={0}
            wrap
            wrapMode={Pango.WrapMode.WORD_CHAR}
            maxWidthChars={24}
          />
        )}

        {imageToDisplay && (
          <box
            css={`
              background-image: url("${imageToDisplay}");
              background-size: cover;
              background-position: center;
              border-radius: 8px;
              min-height: 140px;
              margin-top: 4px;
            `}
          />
        )}
      </box>

      {/* ACTIONS */}
      {notif.actions && notif.actions.length > 0 && (
        <box spacing={8} class="notif-actions" marginTop={8}>
          {notif.actions.map((action: { id: string; label: string }) => (
            <button
              class="notif-action-btn"
              hexpand
              onClicked={() => {
                notif.invoke(action.id)
                onDismiss()
              }}
            >
              <label label={action.label} ellipsize={Pango.EllipsizeMode.END} />
            </button>
          ))}
        </box>
      )}
    </box>
  )
}

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
      layer={Astal.Layer.OVERLAY}
      application={app}
      visible={popups.as((p) => p.length > 0)}
    >
      <box
        orientation={Gtk.Orientation.VERTICAL}
        spacing={8}
        valign={Gtk.Align.START}
      >
        <For each={popups}>
          {(notif) => (
            <PopupCard notif={notif} onDismiss={() => dismissPopup(notif.id)} />
          )}
        </For>
      </box>
    </window>
  )
}
