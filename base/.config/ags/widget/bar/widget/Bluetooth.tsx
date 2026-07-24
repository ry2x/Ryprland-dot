import { createBinding as bind } from 'ags';
import { Gdk } from 'ags/gtk4';

import AstalBluetooth from 'gi://AstalBluetooth';

import { LucideIcon } from '../../../lib/lucide';
import { toggleControlCenter } from '../../../services/windowManager';

export default function Bluetooth({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const bluetooth = AstalBluetooth.get_default();

  const icon = bind(bluetooth, 'is_powered').as((powered) =>
    powered ? 'bluetooth' : 'bluetooth-off',
  );

  const toggleMenu = () => {
    toggleControlCenter(gdkmonitor.get_connector());
  };

  return (
    <button class="network-btn Bluetooth" onClicked={toggleMenu}>
      <LucideIcon name={icon} />
    </button>
  );
}
