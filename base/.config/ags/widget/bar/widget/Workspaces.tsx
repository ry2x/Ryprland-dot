import { Gdk, Gtk } from 'ags/gtk4';
import { createState } from 'ags';

import Hyprland from 'gi://AstalHyprland';

interface WsBox extends Gtk.Box {
  _ws_id?: number;
}

export default function Workspaces({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const hypr = Hyprland.get_default();
  const connector = gdkmonitor.get_connector();

  const [activeIdx, setActiveIdx] = createState(0);

  const dotsContainer = (<box orientation={Gtk.Orientation.VERTICAL} spacing={12} />) as Gtk.Box;

  const getChildren = (): WsBox[] => {
    const children: WsBox[] = [];
    let child = dotsContainer.get_first_child();
    while (child) {
      children.push(child as WsBox);
      child = child.get_next_sibling();
    }
    return children;
  };

  const updateIdx = () => {
    const fw = hypr.get_focused_workspace();
    const children = getChildren();
    const idx = children.findIndex((c) => (c as WsBox)._ws_id === fw?.id);
    setActiveIdx(idx >= 0 ? idx : 0);
  };

  const createWorkspaceBtn = (ws: Hyprland.Workspace) => {
    const wsId = ws.id;
    const btn = new Gtk.Button({
      valign: Gtk.Align.CENTER,
      halign: Gtk.Align.CENTER,
      cssClasses:
        hypr.get_focused_workspace()?.id === wsId ? ['workspace', 'active'] : ['workspace'],
    });

    btn.connect('clicked', () => hypr.dispatch('workspace', wsId.toString()));

    const updateActive = () => {
      const fw = hypr.get_focused_workspace();
      btn.set_css_classes(fw?.id === wsId ? ['workspace', 'active'] : ['workspace']);
    };

    const hookId = hypr.connect('notify::focused-workspace', updateActive);

    const box = (
      <box
        valign={Gtk.Align.CENTER}
        halign={Gtk.Align.CENTER}
      >
        {btn}
      </box>
    ) as Gtk.Box;

    (box as WsBox)._ws_id = ws.id;

    box.connect('destroy', () => {
      hypr.disconnect(hookId);
    });

    return box;
  };

  // Initial load
  const initialWss = hypr
    .get_workspaces()
    .filter((ws) => ws.monitor && ws.monitor.name === connector)
    .filter((ws) => !ws.name.startsWith('special'))
    .sort((a, b) => a.id - b.id);

  for (const ws of initialWss) {
    dotsContainer.append(createWorkspaceBtn(ws));
  }

  updateIdx();

  const hook1 = hypr.connect('workspace-added', (_, ws: Hyprland.Workspace) => {
    if (ws.monitor && ws.monitor.name === connector && !ws.name.startsWith('special')) {
      const btn = createWorkspaceBtn(ws);
      const children = getChildren();
      const insertIdx = children.findIndex((c) => (c as WsBox)._ws_id! > ws.id);

      if (insertIdx === -1) {
        dotsContainer.append(btn);
      } else if (insertIdx === 0) {
        dotsContainer.prepend(btn);
      } else {
        dotsContainer.insert_child_after(btn, children[insertIdx - 1]);
      }
      updateIdx();
    }
  });

  const hook2 = hypr.connect('workspace-removed', (_, id: number) => {
    const target = getChildren().find((c) => (c as WsBox)._ws_id === id);
    if (target) {
      dotsContainer.remove(target);
      updateIdx();
    }
  });

  const hook3 = hypr.connect('notify::focused-workspace', updateIdx);

  dotsContainer.connect('destroy', () => {
    hypr.disconnect(hook1);
    hypr.disconnect(hook2);
    hypr.disconnect(hook3);
  });

  const indicator = (
    <box
      class="active-indicator"
      halign={Gtk.Align.CENTER}
      valign={Gtk.Align.START}
      css={activeIdx.as((i) => `margin-bottom: -14px; transform: translateY(${i * 22 - 2}px);`)}
    />
  );

  return (
    <box class="Workspaces" halign={Gtk.Align.FILL} orientation={Gtk.Orientation.VERTICAL}>
      {indicator}
      {dotsContainer}
    </box>
  );
}
