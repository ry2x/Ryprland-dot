import { onCleanup } from 'gnim';
import system from 'system';

import { Gtk } from 'ags/gtk4';

import Notifd from 'gi://AstalNotifd';
import Gdk from 'gi://Gdk';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';

import { LucideIcon } from '../../lib/lucide';

export function resolveImage(img: string | null) {
  if (!img) return null;
  if (img.startsWith('file://')) return img;
  if (img.startsWith('/')) return `file://${img}`;
  return null;
}

export default function NotificationCard({
  notif,
  onDismiss,
}: {
  notif: Notifd.Notification;
  onDismiss?: () => void;
}) {
  const appIcon = notif.app_icon || notif.desktop_entry || notif.image;
  const appIconPath = resolveImage(appIcon);
  const imageToDisplay = resolveImage(notif.image);

  const timeStr = new Date(notif.time * 1000).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  let appIconPic: Gtk.Picture | null = null;
  let imagePic: Gtk.Picture | null = null;
  let releaseTimeout: ReturnType<typeof setTimeout> | null = null;
  let isDestroyed = false;

  const releaseImages = () => {
    if (appIconPic) {
      appIconPic.set_paintable(null as unknown as Gdk.Paintable);
      appIconPic = null;
    }
    if (imagePic) {
      imagePic.set_paintable(null as unknown as Gdk.Paintable);
      imagePic = null;
    }
  };

  const collectGarbage = () => {
    try {
      system.gc();
    } catch (e) {
      console.error(e);
    }
  };

  const resolvedHook = notif.connect('resolved', () => {
    if (releaseTimeout) clearTimeout(releaseTimeout);
    releaseTimeout = setTimeout(() => {
      releaseImages();
      releaseTimeout = null;
      collectGarbage();
    }, 300);
  });

  const cleanup = () => {
    if (isDestroyed) return;
    isDestroyed = true;
    if (releaseTimeout) {
      clearTimeout(releaseTimeout);
      releaseTimeout = null;
    }
    releaseImages();
    notif.disconnect(resolvedHook);
    collectGarbage();
  };

  const onDestroy = () => {
    cleanup();
  };

  onCleanup(cleanup);

  return (
    <box
      onDestroy={onDestroy}
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
              css="min-width: 32px; min-height: 32px;"
              overflow={Gtk.Overflow.HIDDEN}
              valign={Gtk.Align.CENTER}
            >
              <overlay
                $={(self: Gtk.Overlay) => {
                  const dummyBox = (<box widthRequest={32} heightRequest={32} />) as Gtk.Widget;
                  self.set_child(dummyBox);

                  const pic = new Gtk.Picture({
                    canFocus: false,
                    canShrink: true,
                    contentFit: Gtk.ContentFit.CONTAIN,
                  });
                  appIconPic = pic;
                  try {
                    const file = Gio.File.new_for_uri(appIconPath);
                    pic.set_paintable(Gdk.Texture.new_from_file(file));
                  } catch (e) {
                    console.error(e);
                  }
                  self.add_overlay(pic);
                }}
              />
            </box>
          ) : appIcon ? (
            <image iconName={appIcon} pixelSize={32} valign={Gtk.Align.CENTER} />
          ) : (
            <LucideIcon name="message-square" pixelSize={24} valign={Gtk.Align.CENTER} />
          )}
        </box>

        {/* SUMMARY & APP NAME & TIME */}
        <box orientation={Gtk.Orientation.VERTICAL} hexpand>
          <box orientation={Gtk.Orientation.HORIZONTAL}>
            <label
              label={notif.app_name ?? 'Notify-send'}
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
              onClicked={() => {
                onDismiss?.();
                notif.dismiss();
              }}
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
          css="border-radius: 8px; min-height: 140px; margin-top: 4px;"
          overflow={Gtk.Overflow.HIDDEN}
        >
          <overlay
            $={(self: Gtk.Overlay) => {
              const dummyBox = (<box hexpand={true} heightRequest={140} />) as Gtk.Widget;
              self.set_child(dummyBox);

              const pic = new Gtk.Picture({
                canFocus: false,
                canShrink: true,
                contentFit: Gtk.ContentFit.COVER,
              });
              imagePic = pic;
              try {
                const file = Gio.File.new_for_uri(imageToDisplay);
                pic.set_paintable(Gdk.Texture.new_from_file(file));
              } catch (e) {
                console.error(e);
              }
              self.add_overlay(pic);
            }}
          />
        </box>
      )}

      {/* ACTIONS */}
      {notif.get_actions().length > 0 && (
        <box spacing={8} class="notif-actions" marginTop={4}>
          {notif.get_actions().map((action) => (
            <button class="notif-action-btn" hexpand onClicked={() => notif.invoke(action.id)}>
              <label label={action.label} />
            </button>
          ))}
        </box>
      )}
    </box>
  );
}
