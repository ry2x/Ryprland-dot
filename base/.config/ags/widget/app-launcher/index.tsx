import { createState } from 'ags';
import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import Apps from 'gi://AstalApps';
import GLib from 'gi://GLib';

import { recordAppLaunch, searchApps, searchWeb } from '../../services/apps';
import { toggleAppLauncher } from '../../services/windowManager';
import { createAppItem } from './widget/AppItem';
import { SearchGoogleBtn } from './widget/SearchGoogleBtn';

GLib.setenv('GSK_RENDERER', 'gl', true);

export default function AppLauncher(gdkmonitor: Gdk.Monitor) {
  const [text, setText] = createState('');
  const [selectedIndex, setSelectedIndex] = createState(0);
  const searchEntry = (
    <entry class="applauncher-input" placeholderText="Search apps..." hexpand />
  ) as Gtk.Entry;
  searchEntry.connect('changed', () => {
    setText(searchEntry.get_text());
    setSelectedIndex(0);
  });

  const searchGoogleBtn = SearchGoogleBtn({
    textState: text,
    monitorConnector: gdkmonitor.get_connector(),
  });

  const appList = (<box orientation={Gtk.Orientation.VERTICAL} spacing={10} />) as Gtk.Box;

  const widgetMap = new Map<string, Gtk.Widget>();

  function getAppKey(appInstance: Apps.Application) {
    return appInstance.name + (appInstance.description || '') + (appInstance.iconName || '');
  }

  let currentResults: Apps.Application[] = [];

  function populateApps() {
    const safeT = text() || '';
    const q = safeT.trim().toLowerCase();

    const rawResults = searchApps(q);
    currentResults = [];
    const seen = new Set<string>();
    rawResults.forEach((res) => {
      const key = getAppKey(res);
      if (!seen.has(key)) {
        seen.add(key);
        currentResults.push(res);
      }
    });

    for (const [, w] of widgetMap) {
      w.set_visible(false);
    }

    let prev: Gtk.Widget | null = null;
    currentResults.forEach((res) => {
      const key = getAppKey(res);
      let w = widgetMap.get(key);
      if (!w) {
        w = createAppItem(res, gdkmonitor.get_connector());
        widgetMap.set(key, w);
        appList.append(w);
      }
      w.set_visible(true);
      appList.reorder_child_after(w, prev);
      prev = w;
    });

    GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
      updateSelection();
      return GLib.SOURCE_REMOVE;
    });
  }

  text.subscribe(() => populateApps());

  GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
    populateApps();
    return GLib.SOURCE_REMOVE;
  });

  const scrollWindow = Object.assign(new Gtk.ScrolledWindow(), {
    cssClasses: ['applauncher-scroll'],
    hscrollbarPolicy: Gtk.PolicyType.NEVER,
    vscrollbarPolicy: Gtk.PolicyType.AUTOMATIC,
    vexpand: true,
    minContentWidth: 400,
    minContentHeight: 300,
    maxContentHeight: 600,
    propagateNaturalHeight: false,
    child: (
      <box orientation={Gtk.Orientation.VERTICAL} class="applauncher-list" spacing={10}>
        {appList}
        {searchGoogleBtn}
      </box>
    ),
  });

  function updateSelection() {
    const idx = selectedIndex.get();
    const results = currentResults;

    let targetChild: Gtk.Widget | null = null;

    // update appList children
    let child = appList.get_first_child();
    let i = 0;
    while (child) {
      if (child.get_visible()) {
        if (i === idx) {
          child.add_css_class('selected');
          targetChild = child;
        } else {
          child.remove_css_class('selected');
        }
        i++;
      } else {
        child.remove_css_class('selected');
      }
      child = child.get_next_sibling();
    }

    // update searchGoogleBtn
    if (idx === results.length && (text.get() || '').trim() !== '') {
      searchGoogleBtn.add_css_class('selected');
      targetChild = searchGoogleBtn;
    } else {
      searchGoogleBtn.remove_css_class('selected');
    }

    if (targetChild) {
      const vadj = scrollWindow.get_vadjustment();
      const viewport = scrollWindow.get_child();

      if (vadj && viewport) {
        const itemHeight = targetChild.get_height() || 50;

        // Translate relative to the VIEWPORT (visible area)
        const res = targetChild.translate_coordinates(viewport, 0, 0);
        if (Array.isArray(res) && res[0]) {
          const visibleY = res[2];
          const visibleBottom = visibleY + itemHeight;
          const pageSize = vadj.get_page_size();

          if (visibleY < 0) {
            // Item is above the visible area
            vadj.set_value(vadj.get_value() + visibleY - 10);
          } else if (visibleBottom > pageSize) {
            // Item is below the visible area
            vadj.set_value(vadj.get_value() + (visibleBottom - pageSize) + 10);
          }
        }
      }
    }
  }

  selectedIndex.subscribe(() => updateSelection());

  const entryKeyCtrl = new Gtk.EventControllerKey();
  entryKeyCtrl.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);
  entryKeyCtrl.connect('key-pressed', (_, keyval) => {
    const results = currentResults;
    const maxIndex = (text.get() || '').trim() !== '' ? results.length : results.length - 1;
    if (maxIndex < 0) return false;

    if (keyval === Gdk.KEY_Down) {
      const newIndex = Math.min(selectedIndex.get() + 1, maxIndex);
      setSelectedIndex(newIndex);
      return true;
    }
    if (keyval === Gdk.KEY_Up) {
      const newIndex = Math.max(selectedIndex.get() - 1, 0);
      setSelectedIndex(newIndex);
      return true;
    }
    if (keyval === Gdk.KEY_Return || keyval === Gdk.KEY_KP_Enter) {
      const idx = selectedIndex.get();
      if (idx === results.length) {
        const searchQuery = text.get();
        toggleAppLauncher(gdkmonitor.get_connector());
        searchWeb(searchQuery);
      } else if (idx < results.length) {
        toggleAppLauncher(gdkmonitor.get_connector());
        recordAppLaunch(results[idx]);
        results[idx].launch();
      }
      return true;
    }
    return false;
  });
  searchEntry.add_controller(entryKeyCtrl);

  const win = (
    <window
      name={`applauncher-${gdkmonitor.get_connector()}`}
      class="AppLauncher"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.OVERLAY}
      keymode={Astal.Keymode.EXCLUSIVE}
      application={app}
      visible={false}
      onNotifyVisible={(self) => {
        if (!self.visible) {
          searchEntry.set_text('');
          setText('');
          setSelectedIndex(0);
        } else {
          GLib.idle_add(GLib.PRIORITY_DEFAULT_IDLE, () => {
            searchEntry.grab_focus();
            scrollWindow.get_vadjustment()?.set_value(0);
            updateSelection();
            return GLib.SOURCE_REMOVE;
          });
        }
      }}
    >
      <box class="applauncher-window" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
        <box class="applauncher-box-wrapper" halign={Gtk.Align.CENTER} valign={Gtk.Align.CENTER}>
          {/* Left Panel */}
          <box class="applauncher-left-panel" orientation={Gtk.Orientation.VERTICAL} vexpand>
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
  ) as Astal.Window;

  const winKeyCtrl = new Gtk.EventControllerKey();
  winKeyCtrl.connect('key-pressed', (_, keyval) => {
    if (keyval === Gdk.KEY_Escape) {
      win.set_visible(false);
      return true;
    }
    return false;
  });
  win.add_controller(winKeyCtrl);

  return win;
}
