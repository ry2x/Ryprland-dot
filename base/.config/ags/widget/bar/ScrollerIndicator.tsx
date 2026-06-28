import { Gdk, Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"
import { createState } from "ags"
import { LucideIcon } from "../../lib/lucide"

export default function ScrollerIndicator({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor
}) {
  const hypr = Hyprland.get_default()
  const connector = gdkmonitor.get_connector()
  let currentLayout = "scrolling"
  let currentHasClients = false
  const [isVisible, setIsVisible] = createState(false)
  const [info, setInfo] = createState("")

  function updateVisibility() {
    setIsVisible(currentLayout === "scrolling" && currentHasClients)
  }

  function updateLayout() {
    hypr.message_async("j/getoption general:layout", (_, res) => {
      try {
        const out = hypr.message_finish(res)
        const data = JSON.parse(out)
        currentLayout = data.str
        updateVisibility()
      } catch (error) {
        console.error(error)
      }
    })
  }

  function updateInfo() {
    const monitor = hypr.monitors.find((m) => m.name === connector)
    if (!monitor) {
      currentHasClients = false
      updateVisibility()
      return setInfo("0 / 0")
    }

    const fw = monitor.active_workspace
    if (!fw) {
      currentHasClients = false
      updateVisibility()
      return setInfo("0 / 0")
    }

    const clients = fw.clients
      .filter((c) => !c.floating)
      .sort((a, b) => a.x - b.x)
    if (clients.length === 0) {
      currentHasClients = false
      updateVisibility()
      return setInfo("0 / 0")
    }

    const focused = hypr.focused_client
    const activeClient =
      focused && focused.workspace && focused.workspace.id === fw.id
        ? focused
        : fw.last_client
    const index = activeClient
      ? clients.findIndex((c) => c.address === activeClient.address)
      : -1
    const displayIndex = index !== -1 ? index + 1 : 0

    currentHasClients = true
    updateVisibility()
    setInfo(`${displayIndex} / ${clients.length}`)
  }

  // Hook up IPC events for layout changes
  hypr.connect("event", (_, event) => {
    if (event === "configreloaded" || event.includes("scrolling")) {
      updateLayout()
    }
  })

  // Hook up IPC events for window list/focus changes
  hypr.connect("notify::focused-workspace", updateInfo)
  hypr.connect("notify::focused-client", updateInfo)
  hypr.connect("client-added", updateInfo)
  hypr.connect("client-removed", updateInfo)
  hypr.connect("client-moved", updateInfo)

  // Initial fetch
  updateLayout()
  updateInfo()

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={isVisible}
    >
      <box>
        <button
          class="ScrollerIndicator"
          onClicked={() => console.log("TODO: ScrollerIndicator action")}
        >
          <box spacing={4}>
            <LucideIcon name="app-window-mac" class="icon" />
            <label label={info} />
          </box>
        </button>
        <box class="sep" />
      </box>
    </revealer>
  )
}
