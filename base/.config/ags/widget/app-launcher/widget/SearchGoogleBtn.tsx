import { Gtk } from 'ags/gtk4';

import Pango from 'gi://Pango';

import { searchWeb } from '../../../services/apps';
import { toggleAppLauncher } from '../../../services/windowManager';

interface TextState {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  as: (cb: (t: string) => boolean | string) => any;
  peek: () => string | undefined;
}

export function SearchGoogleBtn({
  textState,
  monitorConnector,
}: {
  textState: TextState;
  monitorConnector: string | null;
}) {
  return (
    <button
      class="applauncher-item"
      canFocus={false}
      visible={textState.as((t: string) => (t || '').trim() !== '')}
      onClicked={() => {
        const t = textState.peek() || '';
        toggleAppLauncher(monitorConnector);
        searchWeb(t);
      }}
    >
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={12}>
        <image iconName="web-browser" class="applauncher-item-icon" />
        <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
          <label
            label={textState.as((t: string) => `Search "${t || ''}"`)}
            halign={Gtk.Align.START}
            class="applauncher-item-name"
            ellipsize={Pango.EllipsizeMode.END}
          />
          <label label="Search on Google" halign={Gtk.Align.START} class="applauncher-item-desc" />
        </box>
      </box>
    </button>
  ) as Gtk.Button;
}
