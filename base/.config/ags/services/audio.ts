import { execAsync } from 'ags/process';

import GSound from 'gi://GSound';

import { closeAllControlCenters } from './windowManager';

export function playVolumeSound() {
  const ctx = new GSound.Context();
  try {
    ctx.init(null);
    ctx.play_simple({ 'event.id': 'audio-volume-change' }, null);
  } catch (err) {
    console.error('Failed to play volume sound', err);
  }
}

export function openAudioControl() {
  closeAllControlCenters();
  execAsync('pavucontrol').catch(console.error);
}
