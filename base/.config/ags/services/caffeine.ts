import { createState } from 'ags';
import { execAsync } from 'ags/process';

export type CaffeineState = 'disabled' | 'enabled' | 'remote';

export const [caffeineState, setCaffeineStateObj] = createState<CaffeineState>('disabled');
let currentState: CaffeineState = 'disabled';

function setCaffeineState(val: CaffeineState) {
  currentState = val;
  setCaffeineStateObj(val);
}

const IDLE_DAEMONS = ['hypridle', 'swayidle'];
let activeDaemon = 'hypridle';

function startInhibit() {
  execAsync([
    'bash',
    '-c',
    'systemd-inhibit --what=sleep --who="AGS Caffeine" --why="Remote mode" sleep infinity &',
  ]).catch(console.error);
}

function stopInhibit() {
  execAsync(['pkill', '-f', 'systemd-inhibit --what=sleep --who=AGS Caffeine']).catch(() => {});
}

async function startDaemon() {
  try {
    await execAsync(['pidof', activeDaemon]);
  } catch {
    execAsync(['bash', '-c', `nohup ${activeDaemon} >/dev/null 2>&1 &`]).catch(console.error);
  }
}

function stopDaemon() {
  execAsync(['killall', activeDaemon]).catch(() => {});
}

async function initCaffeine() {
  let isDaemonRunning = false;
  for (const daemon of IDLE_DAEMONS) {
    try {
      // eslint-disable-next-line no-await-in-loop
      await execAsync(['pidof', daemon]);
      activeDaemon = daemon;
      isDaemonRunning = true;
      break;
    } catch {
      // ignore
    }
  }

  let isInhibitRunning = false;
  try {
    await execAsync(['pgrep', '-f', 'systemd-inhibit --what=sleep --who=AGS Caffeine']);
    isInhibitRunning = true;
  } catch {
    // ignore
  }

  if (!isDaemonRunning) {
    setCaffeineState('enabled');
  } else if (isInhibitRunning) {
    setCaffeineState('remote');
  } else {
    setCaffeineState('disabled');
  }
}
initCaffeine();

export function toggleCaffeine() {
  if (currentState === 'disabled') {
    // Disabled -> Enabled (Screen ON, No sleep)
    stopDaemon();
    stopInhibit();
    setCaffeineState('enabled');
  } else if (currentState === 'enabled') {
    // Enabled -> Remote (Screen OFF, No sleep)
    startDaemon();
    startInhibit();
    setCaffeineState('remote');
  } else {
    // Remote -> Disabled (Screen OFF, Sleep enabled)
    startDaemon();
    stopInhibit();
    setCaffeineState('disabled');
  }
}
