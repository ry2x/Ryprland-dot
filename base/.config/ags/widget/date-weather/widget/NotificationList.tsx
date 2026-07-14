import { For, createBinding as bind, createState } from 'ags';
import { Gtk } from 'ags/gtk4';

import Notifd from 'gi://AstalNotifd';

import { LucideIcon } from '../../../lib/lucide';
import NotificationCard from '../../common/NotificationCard';

export default function NotificationList() {
  const notifd = Notifd.get_default();

  const [notifs, setNotifs] = createState<Notifd.Notification[]>(
    notifd.get_notifications().filter((n) => !n.transient),
  );
  const [revealed, setRevealed] = createState<number[]>(notifs.peek().map((n) => n.id));

  const notifiedHook = notifd.connect('notified', (_, id) => {
    const n = notifd.get_notification(id);
    if (n && !n.transient) {
      setNotifs([n, ...notifs.peek()]);
      setTimeout(() => {
        setRevealed([...revealed.peek(), id]);
      }, 10);
    }
  });

  const resolvedHook = notifd.connect('resolved', (_, id) => {
    setRevealed(revealed.peek().filter((rid) => rid !== id));
    setTimeout(() => {
      setNotifs(notifs.peek().filter((n) => n.id !== id));
    }, 300);
  });

  const removeNotification = (id: number) => {
    setRevealed(revealed.peek().filter((rid) => rid !== id));
    setNotifs(notifs.peek().filter((n) => n.id !== id));
  };

  const clearNotifications = () => {
    const current = notifs.peek();
    setRevealed([]);
    setNotifs([]);
    current.forEach((n) => n.dismiss());
  };

  return (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      spacing={16}
      class="right-column"
      onDestroy={() => {
        notifd.disconnect(notifiedHook);
        notifd.disconnect(resolvedHook);
      }}
    >
      <box class="notif-header" spacing={8}>
        <LucideIcon name="bell" pixelSize={20} />
        <label label="Notifications" class="dw-title" halign={Gtk.Align.START} hexpand />

        {/* DND Toggle */}
        <button
          class={bind(notifd, 'dontDisturb').as((d) =>
            d ? 'notif-header-btn dnd active' : 'notif-header-btn dnd',
          )}
          onClicked={() => {
            notifd.dontDisturb = !notifd.dontDisturb;
          }}
          tooltipText="Toggle Do Not Disturb"
        >
          <box spacing={6}>
            <LucideIcon
              name={bind(notifd, 'dontDisturb').as((d) => (d ? 'bell-off' : 'bell'))}
              pixelSize={14}
            />
            <label label="DND" css="font-size: 0.8em; font-weight: 600;" />
          </box>
        </button>

        <button class="notif-header-btn clear-all" onClicked={clearNotifications}>
          <box spacing={6}>
            <LucideIcon name="trash-2" pixelSize={14} />
            <label label="Clear All" css="font-size: 0.8em; font-weight: 600;" />
          </box>
        </button>
      </box>

      <scrolledwindow
        cssClasses={['notif-scroll']}
        vscrollbarPolicy={Gtk.PolicyType.AUTOMATIC}
        hscrollbarPolicy={Gtk.PolicyType.NEVER}
        vexpand={true}
      >
        <box orientation={Gtk.Orientation.VERTICAL} spacing={12} class="notif-list">
          <For each={notifs} cleanup={(element) => element.run_dispose()}>
            {(notif) => {
              const n = notif as Notifd.Notification;
              return (
                <revealer
                  transitionType={Gtk.RevealerTransitionType.SLIDE_UP}
                  transitionDuration={300}
                  revealChild={revealed.as((ids) => ids.includes(n.id))}
                >
                  <revealer
                    transitionType={Gtk.RevealerTransitionType.CROSSFADE}
                    transitionDuration={300}
                    revealChild={revealed.as((ids) => ids.includes(n.id))}
                  >
                    <NotificationCard notif={n} onDismiss={() => removeNotification(n.id)} />
                  </revealer>
                </revealer>
              );
            }}
          </For>
        </box>
      </scrolledwindow>
    </box>
  );
}
