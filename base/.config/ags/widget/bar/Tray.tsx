import { Gtk } from "ags/gtk4"
import AstalTray from "gi://AstalTray"
import { createBinding, For } from "ags"
import Gio from "gi://Gio"
import GObject from "gi://GObject"
import GLib from "gi://GLib"

// @ts-ignore
const ProxyActionGroup: any = GObject.registerClass(
  {
    GTypeName: "ProxyActionGroup",
    Implements: [Gio.ActionGroup],
  },
  class ProxyActionGroup extends GObject.Object {
    _realGroup!: Gio.ActionGroup

    _init(realGroup: Gio.ActionGroup) {
      super._init()
      this._realGroup = realGroup

      this._realGroup.connect("action-added", (_: any, name: string) =>
        this.emit("action-added", name),
      )
      this._realGroup.connect("action-removed", (_: any, name: string) =>
        this.emit("action-removed", name),
      )
      this._realGroup.connect(
        "action-enabled-changed",
        (_: any, name: string, _enabled: boolean) =>
          this.emit("action-enabled-changed", name, true),
      )
      this._realGroup.connect(
        "action-state-changed",
        (_: any, name: string, state: GLib.Variant) =>
          this.emit("action-state-changed", name, state),
      )
    }
    vfunc_has_action(_name: string) {
      return true
    } // PRETEND EVERYTHING EXISTS
    vfunc_list_actions() {
      return this._realGroup.list_actions()
    }
    vfunc_get_action_enabled(_name: string) {
      return true
    } // FORCE TRUE TO PREVENT GRAY-OUT
    vfunc_get_action_parameter_type(name: string) {
      return this._realGroup.has_action(name)
        ? this._realGroup.get_action_parameter_type(name)
        : null
    }
    vfunc_get_action_state_type(name: string) {
      return this._realGroup.has_action(name)
        ? this._realGroup.get_action_state_type(name)
        : null
    }
    vfunc_get_action_state_hint(name: string) {
      return this._realGroup.has_action(name)
        ? this._realGroup.get_action_state_hint(name)
        : null
    }
    vfunc_get_action_state(name: string) {
      return this._realGroup.has_action(name)
        ? this._realGroup.get_action_state(name)
        : null
    }
    vfunc_change_action_state(name: string, value: GLib.Variant) {
      if (this._realGroup.has_action(name))
        this._realGroup.change_action_state(name, value)
    }
    vfunc_activate_action(name: string, param: GLib.Variant | null) {
      if (this._realGroup.has_action(name))
        this._realGroup.activate_action(name, param)
    }
  },
)

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
              const popover = new Gtk.PopoverMenu()

              let currentModel: Gio.MenuModel | null = null
              let currentGroup: Gio.ActionGroup | null = null

              const updateMenu = () => {
                if (currentModel !== item.menu_model) {
                  currentModel = item.menu_model
                  popover.set_menu_model(currentModel)
                }

                if (currentGroup !== item.action_group) {
                  currentGroup = item.action_group
                  if (currentGroup) {
                    const proxy = new ProxyActionGroup(currentGroup)
                    popover.insert_action_group("dbusmenu", proxy)
                  } else {
                    popover.insert_action_group("dbusmenu", null)
                  }
                }
              }

              updateMenu()

              const id1 = item.connect("notify::menu-model", updateMenu)
              const id2 = item.connect("notify::action-group", updateMenu)

              const mb = (
                <menubutton
                  class="tray-item"
                  tooltipMarkup={createBinding(item, "tooltip_markup")}
                  popover={popover}
                >
                  <image gicon={createBinding(item, "gicon")} pixelSize={18} />
                </menubutton>
              )

              mb.connect("destroy", () => {
                item.disconnect(id1)
                item.disconnect(id2)
              })

              return mb
            }}
          </For>
        </box>
      </box>
    </revealer>
  )
}
