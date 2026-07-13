import { createState } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

import { LucideIcon } from '../../../lib/lucide';
import { toggleScrollerOverview } from '../../../services/windowManager';

export default function ScrollerIndicator({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const hypr = Hyprland.get_default();
  const connector = gdkmonitor.get_connector();

  const [isVisible, setIsVisible] = createState(false);
  const [info, setInfo] = createState({ current: 0, total: 0 });

  let currentLayout = 'scrolling';

  function updateLayout() {
    hypr.message_async('j/getoption general:layout', (_, res) => {
      try {
        const out = hypr.message_finish(res);
        const data = JSON.parse(out);
        currentLayout = data.str;
        updateVisibility();
      } catch (error) {
        console.error(error);
      }
    });
  }

  function updateVisibility() {
    setIsVisible(currentLayout === 'scrolling' && info.get().total > 0);
  }

  let updateTimeout: ReturnType<typeof setTimeout> | null = null;
  function updateInfo() {
    if (updateTimeout) return;
    updateTimeout = setTimeout(() => {
      updateTimeout = null;

      const monitor = hypr.monitors.find((m) => m.name === connector);
      if (!monitor) {
        setInfo({ current: 0, total: 0 });
        updateVisibility();
        return;
      }

      const fw = monitor.active_workspace;
      if (!fw) {
        setInfo({ current: 0, total: 0 });
        updateVisibility();
        return;
      }

      const clients = fw.clients.filter((c) => !c.floating).sort((a, b) => a.x - b.x);
      if (clients.length === 0) {
        setInfo({ current: 0, total: 0 });
        updateVisibility();
        return;
      }

      const focused = hypr.focused_client;
      const activeClient = focused && focused.workspace?.id === fw.id ? focused : fw.last_client;
      const index = activeClient
        ? clients.findIndex((c) => c.address === activeClient.address)
        : -1;
      const displayIndex = index !== -1 ? index + 1 : 0;

      setInfo({ current: displayIndex, total: clients.length });
      updateVisibility();
    }, 10);
  }

  const hooks = [
    hypr.connect('event', (_, event) => {
      if (event === 'configreloaded' || event.includes('scrolling')) updateLayout();
    }),
    hypr.connect('notify::focused-workspace', updateInfo),
    hypr.connect('notify::focused-client', updateInfo),
    hypr.connect('client-added', updateInfo),
    hypr.connect('client-removed', updateInfo),
    hypr.connect('client-moved', updateInfo),
  ];

  updateLayout();
  updateInfo();

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={isVisible}
      onDestroy={() => hooks.forEach((h) => hypr.disconnect(h))}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <button class="ScrollerIndicator" onClicked={toggleScrollerOverview}>
          <box
            spacing={0}
            orientation={Gtk.Orientation.VERTICAL}
            valign={Gtk.Align.CENTER}
            halign={Gtk.Align.CENTER}
          >
            <LucideIcon name="app-window-mac" class="icon" css="margin-bottom: 4px;" />
            <label label={info.as((i) => String(i.current))} css="font-weight: 800;" />
            <box
              class="separator"
              halign={Gtk.Align.CENTER}
              css="min-height: 3px; min-width: 12px; margin: 2px 0; border-radius: 2px;"
            />
            <label label={info.as((i) => String(i.total))} css="font-weight: 800;" />
          </box>
        </button>
      </box>
    </revealer>
  );
}
