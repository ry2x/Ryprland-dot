import { createState } from 'ags';
import { execAsync } from 'ags/process';

export const [isCaffeineEnabled, setCaffeineEnabledState] = createState(false);
let currentState = false;

function setCaffeineEnabled(val: boolean) {
  currentState = val;
  setCaffeineEnabledState(val);
}

const IDLE_DAEMONS = ['hypridle', 'swayidle'];
let activeDaemon = 'hypridle';

// Check initial state
async function initCaffeine() {
  for (const daemon of IDLE_DAEMONS) {
    try {
      await execAsync(['pidof', daemon]);
      activeDaemon = daemon;
      setCaffeineEnabled(false); // Running = Caffeine OFF
      return;
    } catch {
      // not running
    }
  }
  // None running = Caffeine ON
  setCaffeineEnabled(true);
}
initCaffeine();

export function toggleCaffeine() {
  if (currentState) {
    // Disable Caffeine -> Start the idle daemon
    execAsync(['bash', '-c', `nohup ${activeDaemon} >/dev/null 2>&1 &`])
      .then(() => setCaffeineEnabled(false))
      .catch(console.error);
  } else {
    // Enable Caffeine -> Stop the idle daemon
    execAsync(['killall', activeDaemon])
      .then(() => setCaffeineEnabled(true))
      .catch(console.error);
  }
}
