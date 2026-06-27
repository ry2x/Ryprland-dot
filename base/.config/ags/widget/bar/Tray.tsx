import { Gtk } from "ags/gtk4"
import AstalTray from "gi://AstalTray"
import { createBinding, For } from "ags"

export default function Tray() {
  const tray = AstalTray.get_default()
  const items = createBinding(tray, "items").as((list) =>
    list.filter((item) => item.id.toLowerCase().includes("fcitx")),
  )

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_LEFT}
      transitionDuration={250}
      revealChild={items.as((i) => i.length > 0)}
    >
      <box>
        <box class="sep" />
        <box class="Tray">
          <For each={items}>
            {(item) => (
              <button
                class="tray-item"
                tooltipMarkup={createBinding(item, "tooltip_markup")}
                onClicked={() => item.activate(0, 0)}
              >
                <image gicon={createBinding(item, "gicon")} pixelSize={18} />
              </button>
            )}
          </For>
        </box>
      </box>
    </revealer>
  )
}
