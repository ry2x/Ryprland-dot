import { Gdk, Gtk } from 'ags/gtk4';

import Apps from 'gi://AstalApps';

import { recordAppLaunch, searchWeb } from '../../../services/apps';
import { toggleAppLauncher } from '../../../services/windowManager';

interface State<T> {
  get: () => T;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as: (cb: (v: T) => any) => any;
  subscribe: (cb: () => void) => void;
}

export function SearchInput({
  text,
  setText,
  selectedIndex,
  setSelectedIndex,
  getResults,
  monitorConnector,
}: {
  text: State<string>;
  setText: (v: string) => void;
  selectedIndex: State<number>;
  setSelectedIndex: (v: number) => void;
  getResults: () => Apps.Application[];
  monitorConnector: string | null;
}) {
  const searchEntry = (
    <entry class="applauncher-input" placeholderText="Search apps..." hexpand />
  ) as Gtk.Entry;

  searchEntry.connect('changed', () => {
    setText(searchEntry.get_text());
    setSelectedIndex(0);
  });

  const entryKeyCtrl = new Gtk.EventControllerKey();
  entryKeyCtrl.set_propagation_phase(Gtk.PropagationPhase.CAPTURE);
  entryKeyCtrl.connect('key-pressed', (_, keyval) => {
    const results = getResults();
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
        toggleAppLauncher(monitorConnector);
        searchWeb(searchQuery);
      } else if (idx < results.length) {
        toggleAppLauncher(monitorConnector);
        recordAppLaunch(results[idx]);
        results[idx].launch();
      }
      return true;
    }
    return false;
  });
  searchEntry.add_controller(entryKeyCtrl);

  return searchEntry;
}
