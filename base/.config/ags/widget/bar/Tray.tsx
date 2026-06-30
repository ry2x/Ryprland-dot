import { Gtk } from "ags/gtk4"
import AstalTray from "gi://AstalTray"
import GLib from "gi://GLib"
import { createBinding, For } from "ags"
import { execAsync } from "ags/process"
import { LucideIcon } from "../../lib/lucide"

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
            {(item) => {
              const btn = (
                <button
                  class="tray-item"
                  tooltipMarkup={createBinding(item, "tooltip_markup")}
                  onClicked={() => item.activate(0, 0)}
                >
                  <image gicon={createBinding(item, "gicon")} pixelSize={18} />
                </button>
              ) as Gtk.Button

              const popover = new Gtk.Popover()
              popover.set_parent(btn)
              popover.set_has_arrow(false)
              popover.add_css_class("tray-menu")

              popover.set_child(
                <box orientation={Gtk.Orientation.VERTICAL} spacing={4}>
                  <button
                    class="tray-menu-btn"
                    onClicked={() => {
                      popover.popdown()
                      const env = GLib.getenv("QT_QPA_PLATFORMTHEME")
                      execAsync([
                        "bash",
                        "-c",
                        `QT_QPA_PLATFORMTHEME=${env} fcitx5-configtool`,
                      ]).catch(() => {})
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
                      popover.popdown()
                      execAsync(["fcitx5-remote", "-r"]).catch(() => {})
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
                      popover.popdown()
                      execAsync(["bash", "-c", "fcitx5 -r"]).catch(() => {})
                    }}
                  >
                    <box spacing={8}>
                      <LucideIcon name="power" pixelSize={16} />
                      <label label="Restart" />
                    </box>
                  </button>
                </box>,
              )

              const rightClick = new Gtk.GestureClick({ button: 3 })
              rightClick.connect("pressed", () => popover.popup())
              btn.add_controller(rightClick)

              btn.connect("destroy", () => popover.unparent())

              return btn
            }}
          </For>
        </box>
      </box>
    </revealer>
  )
}
