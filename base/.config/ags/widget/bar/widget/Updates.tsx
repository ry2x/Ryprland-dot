import { Gdk } from 'ags/gtk4';
import { Gtk } from 'ags/gtk4';

import { LucideIcon } from '../../../lib/lucide';
import { updatesPoll } from '../../../services/updates';
import { toggleControlCenter } from '../../../services/windowManager';

export default function Updates({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const isVisible = updatesPoll.as((u) => parseInt(u) > 0);

  const toggleMenu = () => {
    toggleControlCenter(gdkmonitor.get_connector());
  };

  return (
    <revealer
      transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
      transitionDuration={250}
      revealChild={isVisible}
      visible={isVisible}
    >
      <box orientation={Gtk.Orientation.VERTICAL}>
        <button class="Updates" onClicked={toggleMenu}>
          <box spacing={4} orientation={Gtk.Orientation.VERTICAL}>
            <LucideIcon name="package" class="icon" />
            <label label={updatesPoll} />
          </box>
        </button>
      </box>
    </revealer>
  );
}
