import { createState } from 'ags';
import { execAsync } from 'ags/process';

const SCRIPT_PATH = '/home/haku/Profile/Dotfile/base/.config/hypr/scripts/backlight.sh';

export const [brightness, setBrightnessState] = createState(0.5); // Default to 50%

let isSetting = false;
let pendingTarget: number | null = null;
let setTimer: ReturnType<typeof setTimeout> | null = null;

function processSet() {
  if (isSetting || pendingTarget === null) return;

  isSetting = true;
  const target = pendingTarget;
  pendingTarget = null;

  const val = Math.round(target * 100);

  execAsync([SCRIPT_PATH, '--set', val.toString()])
    .then(() => {
      isSetting = false;
      if (pendingTarget !== null) {
        processSet();
      }
    })
    .catch((err) => {
      console.error('Failed to set brightness:', err);
      isSetting = false;
      if (pendingTarget !== null) processSet();
    });
}

export function setBrightness(val: number) {
  setBrightnessState(val);

  pendingTarget = val;

  if (setTimer) clearTimeout(setTimer);

  // Wait a short moment to debounce the slider
  setTimer = setTimeout(() => {
    processSet();
  }, 100);
}

export function fetchInitialBrightness() {
  execAsync([SCRIPT_PATH, '--get-first'])
    .then((out) => {
      const val = parseInt(out.trim());
      if (!isNaN(val)) {
        setBrightnessState(val / 100);
      }
    })
    .catch((err) => {
      console.error('Failed to fetch initial brightness:', err);
    });
}

// Fetch on init
fetchInitialBrightness();
