import { For, createBinding as bind, createState } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

import Hyprland from 'gi://AstalHyprland';

export default function Workspaces({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const hypr = Hyprland.get_default();
  const connector = gdkmonitor.get_connector();

  const [workspaces, setWorkspaces] = createState<Hyprland.Workspace[]>([]);
  const [activeIdx, setActiveIdx] = createState(0);

  function updateWorkspaces() {
    const wss = hypr
      .get_workspaces()
      .filter((ws) => ws.monitor && ws.monitor.name === connector)
      .filter((ws) => !ws.name.startsWith('special'))
      .sort((a, b) => a.id - b.id);

    setWorkspaces(wss);

    const fw = hypr.get_focused_workspace();
    const idx = wss.findIndex((ws) => ws.id === fw?.id);
    setActiveIdx(idx >= 0 ? idx : 0);
  }

  const hooks = [
    hypr.connect('workspace-added', updateWorkspaces),
    hypr.connect('workspace-removed', updateWorkspaces),
    hypr.connect('notify::focused-workspace', updateWorkspaces),
  ];

  updateWorkspaces();

  const indicator = (
    <box
      class="active-indicator"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.START}
      css={activeIdx.as((i) => `margin-bottom: -14px; transform: translateY(${i * 22 - 2}px);`)}
    />
  );

  return (
    <box
      class="Workspaces"
      halign={Gtk.Align.FILL}
      orientation={Gtk.Orientation.VERTICAL}
      onDestroy={() => hooks.forEach((h) => hypr.disconnect(h))}
    >
      {indicator}
      <box orientation={Gtk.Orientation.VERTICAL} spacing={12}>
        <For each={workspaces}>
          {(ws: Hyprland.Workspace) => (
            <box valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
              <button
                valign={Gtk.Align.CENTER}
                halign={Gtk.Align.CENTER}
                class={bind(hypr, 'focused_workspace').as((fw) =>
                  fw?.id === ws.id ? 'workspace active' : 'workspace',
                )}
                onClicked={() => hypr.dispatch('workspace', ws.id.toString())}
              />
            </box>
          )}
        </For>
      </box>
    </box>
  );
}
