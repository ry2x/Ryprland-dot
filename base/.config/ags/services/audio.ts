import { execAsync } from 'ags/process';

import { closeAllControlCenters } from './windowManager';

export function playVolumeSound() {
  execAsync(['pw-play', '/usr/share/sounds/freedesktop/stereo/audio-volume-change.oga']).catch(
    () => {},
  );
}

export function openAudioControl() {
  closeAllControlCenters();
  execAsync('pavucontrol').catch(console.error);
}
