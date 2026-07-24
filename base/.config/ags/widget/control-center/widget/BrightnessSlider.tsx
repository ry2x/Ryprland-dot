import { LucideIcon } from '../../../lib/lucide';
import { brightness, setBrightness } from '../../../services/brightness';

export default function BrightnessSlider() {
  const icon = brightness.as((val) => {
    if (val <= 0.2) return 'sun-dim';
    if (val <= 0.8) return 'sun';
    return 'sun-medium';
  });

  return (
    <box class="cc-card" spacing={16}>
      <button class="icon-btn">
        <LucideIcon name={icon} pixelSize={20} />
      </button>

      <slider
        class="brightness-slider"
        hexpand
        drawValue={false}
        min={0}
        max={1}
        value={brightness}
        onChangeValue={(_self, _scroll, val: number) => {
          setBrightness(val);
        }}
      />

      <button
        class="icon-btn"
        css="min-width: 40px; padding: 4px; font-weight: 700; border-radius: 10px;"
      >
        <label label={brightness.as((v) => `${Math.round(v * 100)}%`)} />
      </button>
    </box>
  );
}
