import { createBinding as bind } from 'ags';
import { Gdk } from 'ags/gtk4';

import Network from 'gi://AstalNetwork';

import { LucideIcon } from '../../../lib/lucide';
import { toggleControlCenter } from '../../../services/windowManager';

export default function Wifi({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const network = Network.get_default();
  const wifi = network.wifi;

  if (!wifi) return <box />;

  const wifiIcon = bind(wifi, 'icon_name').as((icon) => {
    if (icon.includes('excellent') || icon.includes('good')) return 'wifi';
    if (icon.includes('ok')) return 'wifi-high';
    if (icon.includes('weak')) return 'wifi-low';
    if (icon.includes('none')) return 'wifi-zero';
    return 'wifi-off';
  });

  const toggleMenu = () => {
    toggleControlCenter(gdkmonitor.get_connector());
  };

  return (
    <button class="network-btn Wifi" onClicked={toggleMenu}>
      <box spacing={4}>
        <LucideIcon name={wifiIcon} class="icon" />
      </box>
    </button>
  );
}
