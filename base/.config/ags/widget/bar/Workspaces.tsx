import { Gdk, Gtk } from "ags/gtk4"
import Hyprland from "gi://AstalHyprland"
import { createBinding } from "ags"

export default function Workspaces({
  gdkmonitor,
}: {
  gdkmonitor: Gdk.Monitor
}) {
  const hypr = Hyprland.get_default()
  const connector = gdkmonitor.get_connector()

  const focused = createBinding(hypr, "focused_workspace")

  const createWorkspaceBtn = (ws: Hyprland.Workspace) => {
    const wsId = ws.id
    const btn = (
      <button
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
        class={focused.as((fw) =>
          fw?.id === wsId ? "workspace active" : "workspace",
        )}
        onClicked={() => hypr.dispatch("workspace", wsId.toString())}
      />
    )

    const box = (
      <box
        css="min-width: 20px; min-height: 20px;"
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
      >
        {btn}
      </box>
    )

    const rev = (
      <revealer
        transitionType={Gtk.RevealerTransitionType.SWING_LEFT}
        transitionDuration={250}
        revealChild={false}
      >
        {box}
      </revealer>
    ) as Gtk.Revealer

    // Attach workspace ID for lookup
    ;(rev as Gtk.Revealer & { _ws_id?: number })._ws_id = ws.id

    // Trigger reveal animation on next tick
    setTimeout(() => rev.set_reveal_child(true), 10)

    return rev
  }

  const container = (<box class="Workspaces" spacing={4} />) as Gtk.Box

  const getChildren = () => {
    const children: Gtk.Revealer[] = []
    let child = container.get_first_child()
    while (child) {
      children.push(child as Gtk.Revealer)
      child = child.get_next_sibling()
    }
    return children
  }

  // Initial load
  const initialWss = hypr
    .get_workspaces()
    .filter((ws) => ws.monitor && ws.monitor.name === connector)
    .filter((ws) => !ws.name.startsWith("special"))
    .sort((a, b) => a.id - b.id)

  for (const ws of initialWss) {
    const rev = createWorkspaceBtn(ws)
    rev.set_reveal_child(true) // Instant reveal
    container.append(rev)
  }

  const hook1 = hypr.connect("workspace-added", (_, ws: Hyprland.Workspace) => {
    if (
      ws.monitor &&
      ws.monitor.name === connector &&
      !ws.name.startsWith("special")
    ) {
      const rev = createWorkspaceBtn(ws)
      const children = getChildren()
      const insertIdx = children.findIndex(
        (c) => (c as Gtk.Revealer & { _ws_id?: number })._ws_id! > ws.id,
      )

      if (insertIdx === -1) {
        container.append(rev)
      } else if (insertIdx === 0) {
        container.prepend(rev)
      } else {
        container.insert_child_after(rev, children[insertIdx - 1])
      }
    }
  })

  const hook2 = hypr.connect("workspace-removed", (_, id: number) => {
    const target = getChildren().find(
      (c) => (c as Gtk.Revealer & { _ws_id?: number })._ws_id === id,
    )
    if (target) {
      target.set_reveal_child(false)
      setTimeout(() => container.remove(target), 250) // Remove after animation
    }
  })

  container.connect("destroy", () => {
    hypr.disconnect(hook1)
    hypr.disconnect(hook2)
  })

  return container
}
