import { createState } from 'ags';
import { execAsync } from 'ags/process';

import GLib from 'gi://GLib?version=2.0';

const CAFFEINE_REMOTE_FILE = '/tmp/ags_caffeine_remote';

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
  const fd = GLib.creat(CAFFEINE_REMOTE_FILE, 0o644);
  if (fd === -1) {
    console.error(`Failed to create ${CAFFEINE_REMOTE_FILE}`);
  } else {
    GLib.close(fd);
  }
}

function stopInhibit() {
  if (
    GLib.file_test(CAFFEINE_REMOTE_FILE, GLib.FileTest.EXISTS) &&
    GLib.remove(CAFFEINE_REMOTE_FILE) === -1
  ) {
    console.error(`Failed to remove ${CAFFEINE_REMOTE_FILE}`);
  }
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

  const isInhibitRunning = GLib.file_test(CAFFEINE_REMOTE_FILE, GLib.FileTest.EXISTS);

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
