import { Gtk } from "ags/gtk4"
import Notifd from "gi://AstalNotifd"
import Pango from "gi://Pango"
import { LucideIcon } from "../lib/lucide"

export function resolveImage(img: string | null) {
  if (!img) return null
  if (img.startsWith("file://")) return img
  if (img.startsWith("/")) return `file://${img}`
  return null
}

export default function NotificationCard({
  notif,
}: {
  notif: Notifd.Notification
}) {
  const appIcon = notif.app_icon || notif.desktop_entry || notif.image
  const appIconPath = resolveImage(appIcon)
  const imageToDisplay = resolveImage(notif.image)

  const timeStr = new Date(notif.time * 1000).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  })

  return (
    <box
      class={`notif-card urgency-${notif.urgency}`}
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
      widthRequest={380}
    >
      <box spacing={12}>
        {/* ICON */}
        <box class="notif-icon-container" valign={Gtk.Align.START}>
          {appIconPath ? (
            <box
              css={`
                background-image: url("${appIconPath}");
                background-size: contain;
                background-repeat: no-repeat;
                background-position: center;
                min-width: 32px;
                min-height: 32px;
              `}
              valign={Gtk.Align.CENTER}
            />
          ) : appIcon ? (
            <image
              iconName={appIcon}
              pixelSize={32}
              valign={Gtk.Align.CENTER}
            />
          ) : (
            <LucideIcon
              name="message-square"
              pixelSize={24}
              valign={Gtk.Align.CENTER}
            />
          )}
        </box>

        {/* SUMMARY & APP NAME & TIME */}
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label
              label={notif.app_name ?? "Notify-send"}
              class="notif-app"
              xalign={0}
              ellipsize={Pango.EllipsizeMode.END}
              lines={1}
              maxWidthChars={18}
            />
            <box hexpand />
            <label label={timeStr} class="notif-time" xalign={1} />
            {/* CLOSE BUTTON */}
            <button
              class="notif-close"
              onClicked={() => notif.dismiss()}
              valign={Gtk.Align.CENTER}
            >
              <LucideIcon name="x" pixelSize={14} />
            </button>
          </box>
          <label
            label={notif.summary}
            class="notif-summary"
            xalign={0}
            ellipsize={Pango.EllipsizeMode.END}
            lines={1}
            maxWidthChars={24}
          />
        </box>
      </box>

      {/* BODY */}
      {notif.body && (
        <label
          label={notif.body}
          class="notif-body"
          useMarkup={true}
          xalign={0}
          wrap={true}
          wrapMode={Pango.WrapMode.WORD_CHAR}
          maxWidthChars={36}
          lines={3}
          ellipsize={Pango.EllipsizeMode.END}
        />
      )}

      {/* IMAGE */}
      {imageToDisplay && (
        <box
          class="notif-image"
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

      {/* ACTIONS */}
      {notif.get_actions().length > 0 && (
        <box spacing={8} class="notif-actions" marginTop={4}>
          {notif.get_actions().map((action) => (
            <button
              class="notif-action-btn"
              hexpand
              onClicked={() => notif.invoke(action.id)}
            >
              <label label={action.label} />
            </button>
          ))}
        </box>
      )}
    </box>
  )
}
