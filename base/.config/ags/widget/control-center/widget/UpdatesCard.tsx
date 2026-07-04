import { Gtk } from 'ags/gtk4';

import { LucideIcon } from '../../../lib/lucide';
import { openUpdateManager, updatesPoll } from '../../../services/updates';

export default function UpdatesCard() {
  const isAvailable = updatesPoll.as((u) => parseInt(u) > 0);
  const labelText = updatesPoll.as((u) => {
    const count = parseInt(u);
    return count > 0 ? `${count} Updates Available` : 'System is Up to Date';
  });

  return (
    <box class="cc-card" orientation={Gtk.Orientation.HORIZONTAL} spacing={16} hexpand>
      <LucideIcon name="package" pixelSize={24} class="icon updates-icon" />
      <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} hexpand>
        <label
          label="System Updates"
          css="font-weight: 800; font-size: 1.1em;"
          halign={Gtk.Align.START}
        />
        <label label={labelText} css="opacity: 0.7; font-size: 0.9em;" halign={Gtk.Align.START} />
      </box>
      <button
        class="icon-btn"
        valign={Gtk.Align.CENTER}
        visible={isAvailable}
        onClicked={() => openUpdateManager()}
      >
        <LucideIcon name="download" pixelSize={20} />
      </button>
    </box>
  );
}
