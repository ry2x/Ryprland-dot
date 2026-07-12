import { createBinding as bind } from 'ags';

import Wp from 'gi://AstalWp';

import { LucideIcon } from '../../../lib/lucide';
import { openAudioControl, playVolumeSound } from '../../../services/audio';

export default function VolumeSlider() {
  const speaker = Wp.get_default()?.audio.default_speaker;
  if (!speaker) return <box />;

  const volIcon = bind(speaker, 'volume_icon').as((icon) => {
    if (icon.includes('muted')) return 'volume-x';
    if (icon.includes('high')) return 'volume-2';
    if (icon.includes('medium')) return 'volume-1';
    if (icon.includes('low')) return 'volume';
    return 'volume-x';
  });

  let lastPlay = 0;
  const playSound = () => {
    const now = Date.now();
    if (now - lastPlay > 100) {
      lastPlay = now;
      playVolumeSound();
    }
  };

  return (
    <box class="cc-card" spacing={16}>
      <button
        class="icon-btn"
        onClicked={() => (speaker.mute = !speaker.mute)}
        tooltipText="Toggle Mute"
      >
        <LucideIcon name={volIcon} pixelSize={20} />
      </button>

      <slider
        class="volume-slider"
        hexpand
        drawValue={false}
        min={0}
        max={1}
        value={bind(speaker, 'volume')}
        onChangeValue={(_self, _scroll, val: number) => {
          speaker.volume = val;
          playSound();
        }}
      />

      <button
        class="icon-btn"
        css="min-width: 40px; padding: 4px; font-weight: 700; border-radius: 10px;"
        onClicked={() => openAudioControl()}
        tooltipText="Open Audio Control"
      >
        <label label={bind(speaker, 'volume').as((v) => `${Math.round(v * 100)}%`)} />
      </button>
    </box>
  );
}
