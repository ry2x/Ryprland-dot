import { For, createBinding } from 'ags';
import { Gtk } from 'ags/gtk4';

import AstalTray from 'gi://AstalTray';

import { LucideIcon } from '../../../lib/lucide';
import { openFcitxConfig, reloadFcitx, restartFcitx } from '../../../services/input';

export default function Tray() {
  const tray = AstalTray.get_default();
  const items = createBinding(tray, 'items').as((list) =>
    list.filter((item) => item.id.toLowerCase().includes('fcitx')),
  );

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={items.as((i) => i.length > 0)}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <box class="Tray" orientation={Gtk.Orientation.VERTICAL}>
          <For each={items}>
            {(item) => {
              const btn = (
                <button
                  class="tray-item"
                  tooltipMarkup={createBinding(item, 'tooltip_markup')}
                  onClicked={() => item.activate(0, 0)}
                >
                  <image gicon={createBinding(item, 'gicon')} pixelSize={18} />
                </button>
              ) as Gtk.Button;

              const popover = new Gtk.Popover();
              popover.set_parent(btn);
              popover.set_has_arrow(false);
              popover.add_css_class('tray-menu');

              popover.set_child(
                (
                  <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                    <button
                      class="tray-menu-btn"
                      onClicked={() => {
                        popover.popdown();
                        openFcitxConfig();
                      }}
                    >
                      <box spacing={8}>
                        <LucideIcon name="settings" pixelSize={16} />
                        <label label="ConfigTool" />
                      </box>
                    </button>

                    <button
                      class="tray-menu-btn"
                      onClicked={() => {
                        popover.popdown();
                        reloadFcitx();
                      }}
                    >
                      <box spacing={8}>
                        <LucideIcon name="refresh-cw" pixelSize={16} />
                        <label label="Reload" />
                      </box>
                    </button>

                    <button
                      class="tray-menu-btn"
                      onClicked={() => {
                        popover.popdown();
                        restartFcitx();
                      }}
                    >
                      <box spacing={8}>
                        <LucideIcon name="power" pixelSize={16} />
                        <label label="Restart" />
                      </box>
                    </button>
                  </box>
                ) as Gtk.Widget,
              );

              const rightClick = new Gtk.GestureClick({ button: 3 });
              rightClick.connect('pressed', () => popover.popup());
              btn.add_controller(rightClick);

              btn.connect('destroy', () => popover.unparent());

              return btn;
            }}
          </For>
        </box>
      </box>
    </revealer>
  );
}
