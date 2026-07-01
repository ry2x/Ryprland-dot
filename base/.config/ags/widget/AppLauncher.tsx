import GLib from "gi://GLib"
GLib.setenv("GSK_RENDERER", "gl", true)
import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Apps from "gi://AstalApps"
import { createState } from "ags"
import Pango from "gi://Pango"

const apps = new Apps.Apps()

export default function AppLauncher(gdkmonitor: Gdk.Monitor) {
  const { CENTER } = Astal.WindowAnchor
  const [text, setText] = createState("")
  const [selectedIndex, setSelectedIndex] = createState(0)
  const searchEntry = (
    <entry
      class="applauncher-input"
      placeholderText="Search apps..."
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
      visible={text.as((t) => (t || "").trim() !== "")}
      onClicked={() => {
        const t = text.peek() || ""
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
            label={text.as((t) => `Search "${t || ""}"`)}
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
    <box orientation={Gtk.Orientation.VERTICAL} spacing={10} />
  ) as Gtk.Box

  const widgetMap = new Map<string, Gtk.Widget>()

  function getAppKey(appInstance: Apps.Application) {
    return (
      appInstance.name +
      (appInstance.description || "") +
      (appInstance.iconName || "")
    )
  }

  const allApps = apps.get_list()
  let currentResults: Apps.Application[] = []

  // Custom JS-side fuzzy query to completely prevent C/GJS GObject allocation leaks
  function searchApps(q: string) {
    if (q === "") return allApps
    const keywords = q.split(/\s+/)

    const results = allApps
      .map((app) => {
        const name = (app.name || "").toLowerCase()
        const desc = (app.description || "").toLowerCase()
        const exec = (app.executable || "").toLowerCase()
        const searchString = name + " " + desc + " " + exec

        let score = 0
        if (name.startsWith(q)) score += 100
        else if (name.includes(q)) score += 50
        else if (exec.includes(q)) score += 30
        else if (desc.includes(q)) score += 10

        const matchesAll = keywords.every((kw) => searchString.includes(kw))
        if (!matchesAll) score = 0

        return { app, score }
      })
      .filter((x) => x.score > 0)

    results.sort((a, b) => b.score - a.score)
    return results.map((x) => x.app).slice(0, 30) // LIMIT TO 30 APPS TO SAVE MEMORY
  }

  function populateApps() {
    const safeT = text() || ""
    const q = safeT.trim().toLowerCase()

    currentResults = searchApps(q)

    for (const [, w] of widgetMap) {
      w.set_visible(false)
    }

    let prev: Gtk.Widget | null = null
    currentResults.forEach((res) => {
      const key = getAppKey(res)
      let w = widgetMap.get(key)
      if (!w) {
        // Construct vanilla GTK widget to avoid JSX tracking context issues & memory leaks
        const btn = new Gtk.Button({
          cssClasses: ["applauncher-item"],
          canFocus: false,
        })

        const box = new Gtk.Box({
          orientation: Gtk.Orientation.HORIZONTAL,
          spacing: 12,
        })

        const icon = new Gtk.Image({
          iconName: res.iconName || "application-x-executable",
          cssClasses: ["applauncher-item-icon"],
        })

        const textBox = new Gtk.Box({
          orientation: Gtk.Orientation.VERTICAL,
          valign: Gtk.Align.CENTER,
        })

        const nameLabel = new Gtk.Label({
          label: res.name,
          halign: Gtk.Align.START,
          cssClasses: ["applauncher-item-name"],
        })

        textBox.append(nameLabel)

        if (res.description) {
          const descLabel = new Gtk.Label({
            label: res.description,
            halign: Gtk.Align.START,
            cssClasses: ["applauncher-item-desc"],
            ellipsize: Pango.EllipsizeMode.END,
            maxWidthChars: 40,
          })
          textBox.append(descLabel)
        }

        box.append(icon)
        box.append(textBox)
        btn.set_child(box)

        btn.connect("clicked", () => {
          app
            .get_window(`applauncher-${gdkmonitor.get_connector()}`)
            ?.set_visible(false)
          res.launch()
        })

        w = btn
        widgetMap.set(key, w)
        appList.append(w)
      }
      w.set_visible(true)
      appList.reorder_child_after(w, prev)
      prev = w
    })

    import("gi://GLib").then((GLib) => {
      GLib.default.idle_add(GLib.default.PRIORITY_DEFAULT_IDLE, () => {
        updateSelection()
        return GLib.default.SOURCE_REMOVE
      })
    })
  }

  text.subscribe(() => populateApps())

  import("gi://GLib").then((GLib) => {
    GLib.default.idle_add(GLib.default.PRIORITY_DEFAULT_IDLE, () => {
      populateApps()
      return GLib.default.SOURCE_REMOVE
    })
  })

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
    const results = currentResults

    let targetChild: Gtk.Widget | null = null

    // update appList children
    let child = appList.get_first_child()
    let i = 0
    while (child) {
      if (child.get_visible()) {
        if (i === idx) {
          child.add_css_class("selected")
          targetChild = child
        } else {
          child.remove_css_class("selected")
        }
        i++
      } else {
        child.remove_css_class("selected")
      }
      child = child.get_next_sibling()
    }

    // update searchGoogleBtn
    if (idx === results.length && (text.get() || "").trim() !== "") {
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

  const entryKeyCtrl = new Gtk.EventControllerKey()
  entryKeyCtrl.set_propagation_phase(Gtk.PropagationPhase.CAPTURE)
  entryKeyCtrl.connect("key-pressed", (_, keyval) => {
    const results = currentResults
    const maxIndex =
      (text.get() || "").trim() !== "" ? results.length : results.length - 1
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
        const searchQuery = text.get()
        app
          .get_window(`applauncher-${gdkmonitor.get_connector()}`)
          ?.set_visible(false)
        import("ags/process").then(({ execAsync }) => {
          execAsync([
            "xdg-open",
            `https://google.com/search?q=${encodeURIComponent(searchQuery)}`,
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
          searchEntry.set_text("")
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
