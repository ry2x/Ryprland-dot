import GLib from "gi://GLib"
GLib.setenv("GSK_RENDERER", "gl", true)
import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Apps from "gi://AstalApps"
import { For, createState } from "ags"
import Pango from "gi://Pango"

const apps = new Apps.Apps()

function AppItem({
  appInstance,
  hide,
}: {
  appInstance: Apps.Application
  hide: () => void
}) {
  return (
    <button
      class="applauncher-item"
      canFocus={false}
      onClicked={() => {
        hide()
        appInstance.launch()
      }}
    >
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
        <image
          iconName={appInstance.iconName || "application-x-executable"}
          class="applauncher-item-icon"
        />
        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
          <label
            label={appInstance.name}
            halign={Gtk.Align.START}
            class="applauncher-item-name"
          />
          {appInstance.description && (
            <label
              label={appInstance.description}
              halign={Gtk.Align.START}
              class="applauncher-item-desc"
              ellipsize={Pango.EllipsizeMode.END}
              maxWidthChars={40}
            />
          )}
        </box>
      </box>
    </button>
  )
}

export default function AppLauncher(gdkmonitor: Gdk.Monitor) {
  const { CENTER } = Astal.WindowAnchor
  const [text, setText] = createState("")
  const [selectedIndex, setSelectedIndex] = createState(0)
  const filteredApps = text.as((t) => apps.fuzzy_query(t))

  const searchEntry = (
    <entry
      class="applauncher-input"
      placeholderText="Search apps..."
      text={text()}
      onChanged={(self: Gtk.Entry) => {
        setText(self.text)
        setSelectedIndex(0)
      }}
      hexpand
    />
  ) as Gtk.Entry

  const searchGoogleBtn = (
    <button
      class="applauncher-item"
      canFocus={false}
      visible={text.as((t) => t.trim() !== "")}
      onClicked={() => {
        const t = text.peek()
        app
          .get_window(`applauncher-${gdkmonitor.get_connector()}`)
          ?.set_visible(false)
        import("ags/process").then(({ execAsync }) => {
          execAsync([
            "xdg-open",
            `https://google.com/search?q=${encodeURIComponent(t)}`,
          ])
        })
      }}
    >
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
        <image iconName="web-browser" class="applauncher-item-icon" />
        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
          <label
            label={text.as((t) => `Search "${t}"`)}
            halign={Gtk.Align.START}
            class="applauncher-item-name"
            ellipsize={Pango.EllipsizeMode.END}
          />
          <label
            label="Search on Google"
            halign={Gtk.Align.START}
            class="applauncher-item-desc"
          />
        </box>
      </box>
    </button>
  )

  const appList = (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={10}>
      <For each={filteredApps}>
        {(a) => (
          <AppItem
            appInstance={a as Apps.Application}
            hide={() =>
              app
                .get_window(`applauncher-${gdkmonitor.get_connector()}`)
                ?.set_visible(false)
            }
          />
        )}
      </For>
    </box>
  ) as Gtk.Box

  const scrollWindow = Object.assign(new Gtk.ScrolledWindow(), {
    cssClasses: ["applauncher-scroll"],
    hscrollbarPolicy: Gtk.PolicyType.NEVER,
    vscrollbarPolicy: Gtk.PolicyType.AUTOMATIC,
    vexpand: true,
    minContentWidth: 400,
    minContentHeight: 300,
    maxContentHeight: 600,
    propagateNaturalHeight: true,
    child: (
      <box
        orientation={Gtk.Orientation.VERTICAL}
        class="applauncher-list"
        spacing={10}
      >
        {appList}
        {searchGoogleBtn}
      </box>
    ),
  })

  function updateSelection() {
    const idx = selectedIndex.get()
    const results = filteredApps.get()

    let targetChild: Gtk.Widget | null = null

    // update appList children
    let child = appList.get_first_child()
    let i = 0
    while (child) {
      if (i === idx) {
        child.add_css_class("selected")
        targetChild = child
      } else {
        child.remove_css_class("selected")
      }
      child = child.get_next_sibling()
      i++
    }

    // update searchGoogleBtn
    if (idx === results.length && text.get().trim() !== "") {
      searchGoogleBtn.add_css_class("selected")
      targetChild = searchGoogleBtn
    } else {
      searchGoogleBtn.remove_css_class("selected")
    }

    if (targetChild) {
      const vadj = scrollWindow.get_vadjustment()
      const viewport = scrollWindow.get_child()

      if (vadj && viewport) {
        const itemHeight = targetChild.get_height() || 50

        // Translate relative to the VIEWPORT (visible area)
        const res = targetChild.translate_coordinates(viewport, 0, 0)
        if (Array.isArray(res) && res[0]) {
          const visibleY = res[2]
          const visibleBottom = visibleY + itemHeight
          const pageSize = vadj.get_page_size()

          if (visibleY < 0) {
            // Item is above the visible area
            vadj.set_value(vadj.get_value() + visibleY - 10)
          } else if (visibleBottom > pageSize) {
            // Item is below the visible area
            vadj.set_value(vadj.get_value() + (visibleBottom - pageSize) + 10)
          }
        }
      }
    }
  }

  selectedIndex.subscribe(() => updateSelection())
  filteredApps.subscribe(() => {
    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      updateSelection()
      return GLib.SOURCE_REMOVE
    })
  })

  const entryKeyCtrl = new Gtk.EventControllerKey()
  entryKeyCtrl.set_propagation_phase(Gtk.PropagationPhase.CAPTURE)
  entryKeyCtrl.connect("key-pressed", (_, keyval) => {
    const results = filteredApps.get()
    const maxIndex =
      text.get().trim() !== "" ? results.length : results.length - 1
    if (maxIndex < 0) return false

    if (keyval === Gdk.KEY_Down) {
      const newIndex = Math.min(selectedIndex.get() + 1, maxIndex)
      setSelectedIndex(newIndex)
      return true
    }
    if (keyval === Gdk.KEY_Up) {
      const newIndex = Math.max(selectedIndex.get() - 1, 0)
      setSelectedIndex(newIndex)
      return true
    }
    if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
      const idx = selectedIndex.get()
      if (idx === results.length) {
        app
          .get_window(`applauncher-${gdkmonitor.get_connector()}`)
          ?.set_visible(false)
        import("ags/process").then(({ execAsync }) => {
          execAsync([
            "xdg-open",
            `https://google.com/search?q=${encodeURIComponent(text.get())}`,
          ])
        })
      } else if (idx < results.length) {
        app
          .get_window(`applauncher-${gdkmonitor.get_connector()}`)
          ?.set_visible(false)
        results[idx].launch()
      }
      return true
    }
    return false
  })
  searchEntry.add_controller(entryKeyCtrl)

  const win = (
    <window
      name={`applauncher-${gdkmonitor.get_connector()}`}
      class="AppLauncher"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      anchor={CENTER}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={app}
      visible={false}
      onNotifyVisible={(self) => {
        if (!self.visible) {
          setText("")
          setSelectedIndex(0)
        } else {
          import("gi://GLib").then((GLib) => {
            GLib.default.idle_add(GLib.default.PRIORITY_DEFAULT_IDLE, () => {
              searchEntry.grab_focus()
              scrollWindow.get_vadjustment()?.set_value(0)
              updateSelection()
              return GLib.default.SOURCE_REMOVE
            })
          })
        }
      }}
    >
      <box
        class="applauncher-window"
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
      >
        <box
          class="applauncher-box-wrapper"
          halign={Gtk.Align.CENTER}
          valign={Gtk.Align.CENTER}
        >
          {/* Left Panel */}
          <box
            class="applauncher-left-panel"
            orientation={Gtk.Orientation.VERTICAL}
            vexpand
          >
            <box vexpand />
            <box class="applauncher-search-container" hexpand>
              {searchEntry}
            </box>
          </box>

          {/* Right Panel */}
          <box
            class="applauncher-right-panel"
            orientation={Gtk.Orientation.VERTICAL}
            hexpand={false}
          >
            {scrollWindow}
          </box>
        </box>
      </box>
    </window>
  ) as Astal.Window

  const winKeyCtrl = new Gtk.EventControllerKey()
  winKeyCtrl.connect("key-pressed", (_, keyval) => {
    if (keyval === Gdk.KEY_Escape) {
      win.set_visible(false)
      return true
    }
    return false
  })
  win.add_controller(winKeyCtrl)

  return win
}
