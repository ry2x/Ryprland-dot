import { Gtk } from 'ags/gtk4';

import Apps from 'gi://AstalApps';
import GLib from 'gi://GLib';

import { searchApps } from '../../../services/apps';
import { createAppItem } from './AppItem';
import { SearchGoogleBtn } from './SearchGoogleBtn';

interface State<T> {
  get: () => T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as: (cb: (v: T) => any) => any;
  subscribe: (cb: () => void) => void;
}

export function AppList({
  text,
  selectedIndex,
  monitorConnector,
  onResultsChanged,
}: {
  text: State<string>;
  selectedIndex: State<number>;
  monitorConnector: string | null;
  onResultsChanged: (results: Apps.Application[]) => void;
}) {
  const searchGoogleBtn = SearchGoogleBtn({
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    textState: text as any,
    monitorConnector,
  });

  const appList = (<box orientation={Gtk.Orientation.VERTICAL} spacing={10} />) as Gtk.Box;
  const widgetMap = new Map<string, Gtk.Widget>();

  function getAppKey(appInstance: Apps.Application) {
    return appInstance.name + (appInstance.description || '') + (appInstance.iconName || '');
  }

  let currentResults: Apps.Application[] = [];

  function populateApps() {
    const safeT = text.get() || '';
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
    onResultsChanged(currentResults);

    for (const [, w] of widgetMap) {
      w.set_visible(false);
    }

    let prev: Gtk.Widget | null = null;
    currentResults.forEach((res) => {
      const key = getAppKey(res);
      let w = widgetMap.get(key);
      if (!w) {
        w = createAppItem(res, monitorConnector);
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
  }) as Gtk.ScrolledWindow;

  function updateSelection() {
    const idx = selectedIndex.get();
    let targetChild: Gtk.Widget | null = null;

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

    if (idx === currentResults.length && (text.get() || '').trim() !== '') {
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
        const res = targetChild.translate_coordinates(viewport, 0, 0);
        if (Array.isArray(res) && res[0]) {
          const visibleY = res[2];
          const visibleBottom = visibleY + itemHeight;
          const pageSize = vadj.get_page_size();

          if (visibleY < 0) {
            vadj.set_value(vadj.get_value() + visibleY - 10);
          } else if (visibleBottom > pageSize) {
            vadj.set_value(vadj.get_value() + (visibleBottom - pageSize) + 10);
          }
        }
      }
    }
  }

  selectedIndex.subscribe(() => updateSelection());

  return scrollWindow;
}
