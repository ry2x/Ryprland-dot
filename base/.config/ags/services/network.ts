import { execAsync } from 'ags/process';

import { closeAllControlCenters } from './windowManager';

export function toggleWifi(enabled: boolean) {
  execAsync(['bash', '-c', `nmcli radio wifi ${enabled ? 'off' : 'on'}`]).catch(console.error);
}

export function openWifiMenu() {
  closeAllControlCenters();
  execAsync('nmgui').catch(console.error);
}

export function toggleBluetooth(powered: boolean) {
  execAsync(['bash', '-c', `rfkill ${powered ? 'block' : 'unblock'} bluetooth`]).catch(
    console.error,
  );
}

export function openBluetoothMenu() {
  closeAllControlCenters();
  execAsync('blueman-manager').catch(console.error);
}
