import { Gtk } from "ags/gtk4"
import Gio from "gi://Gio"
import AstalTray from "gi://AstalTray"
import { createBinding, For } from "ags"
import { execAsync } from "ags/process"

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
              const menu = new Gio.Menu()
              menu.append("  ConfigTool", "fcitx.config")
              menu.append("󰑓  Reload", "fcitx.reload")
              menu.append("󰐥  Restart", "fcitx.restart")

              const actionGroup = new Gio.SimpleActionGroup()

              const configAction = new Gio.SimpleAction({ name: "config" })
              configAction.connect("activate", () =>
                execAsync([
                  "bash",
                  "-c",
                  "QT_QPA_PLATFORMTHEME=qt6ct fcitx5-configtool",
                ]).catch(() => {}),
              )
              actionGroup.add_action(configAction)

              const reloadAction = new Gio.SimpleAction({ name: "reload" })
              reloadAction.connect("activate", () =>
                execAsync(["fcitx5-remote", "-r"]).catch(() => {}),
              )
              actionGroup.add_action(reloadAction)

              const restartAction = new Gio.SimpleAction({ name: "restart" })
              restartAction.connect("activate", () =>
                execAsync(["bash", "-c", "fcitx5 -r"]).catch(() => {}),
              )
              actionGroup.add_action(restartAction)

              const btn = (
                <button
                  class="tray-item"
                  tooltipMarkup={createBinding(item, "tooltip_markup")}
                  onClicked={() => item.activate(0, 0)}
                >
                  <image gicon={createBinding(item, "gicon")} pixelSize={18} />
                </button>
              ) as Gtk.Button

              btn.insert_action_group("fcitx", actionGroup)

              const popover = Gtk.PopoverMenu.new_from_model(menu)
              popover.set_parent(btn)

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
