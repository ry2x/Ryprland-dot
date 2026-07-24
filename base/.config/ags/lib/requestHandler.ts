import app from 'ags/gtk4/app';

import Hyprland from 'gi://AstalHyprland';
import Notifd from 'gi://AstalNotifd';

import { getPowerProfile, setPowerProfile } from '../services/powerProfile';
import { isRecording, startRecord, stopRecord } from '../services/recordService';
import {
  toggleAppLauncher,
  toggleControlCenter,
  toggleDateWeather,
} from '../services/windowManager';
import { compileAndReloadCss } from './css';

type ResponseCallback = (response: string) => void;

function handlePowerProfile(args: string[], res: ResponseCallback) {
  const power = getPowerProfile();
  if (!power) {
    res('Error: AstalPowerProfiles not available');
    return;
  }
  if (args[0] === 'get' || !args[0]) {
    res(`Current mode: ${power.activeProfile}`);
  } else if (args[0] === 'set' && args[1]) {
    const result = setPowerProfile(args[1]);
    res(result);
  } else {
    res('Usage: ags request "power-profile [get | set <mode>]"');
  }
}

function handleRecord(args: string[], res: ResponseCallback) {
  if (args[0] === 'stop') {
    stopRecord();
    res('Recording stopped');
  } else if (args[0] === 'start') {
    const mode = args[1] === 'slurp' ? 'slurp' : 'monitor';
    startRecord(mode);
    res(`Started recording in ${mode} mode`);
  } else if (args[0] === 'toggle' || !args[0]) {
    if (isRecording()) {
      stopRecord();
      res('Recording stopped');
    } else {
      const mode = args[1] === 'slurp' ? 'slurp' : 'monitor';
      startRecord(mode);
      res(`Started recording in ${mode} mode`);
    }
  } else {
    res('Usage: ags request "record [start|stop|toggle] [monitor|slurp]"');
  }
}

export function requestHandler(request: string[], res: ResponseCallback) {
  const [command, ...args] = request;

  switch (command) {
    case 'reload-css':
      compileAndReloadCss()
        .then(() => res('CSS Reloaded Successfully'))
        .catch((err) => res(`Error: ${String(err)}`));
      break;

    case 'toggle-dnd': {
      const notifd = Notifd.get_default();
      notifd.dontDisturb = !notifd.dontDisturb;
      res(`DND toggled to ${notifd.dontDisturb}`);
      break;
    }

    case 'toggle-notif':
      toggleDateWeather();
      res('Toggled Notification Center');
      break;

    case 'toggle-cc':
      toggleControlCenter();
      res('Toggled Control Center');
      break;

    case 'toggle-launcher':
      toggleAppLauncher();
      res('Toggled App Launcher');
      break;

    case 'list-windows': {
      const focusedMonitor = Hyprland.get_default().get_focused_monitor().name;
      const dw = app.get_window(`date-weather-popup-${focusedMonitor}`);
      res(
        `Focused: ${focusedMonitor} | dw visible: ${dw?.get_visible()} | Windows: ` +
          app
            .get_windows()
            .map((w) => w.name)
            .join(', '),
      );
      break;
    }

    case 'power-profile':
      handlePowerProfile(args, res);
      break;

    case 'record':
      handleRecord(args, res);
      break;

    default:
      res(`Unknown command: ${request.join(' ')}`);
  }
}
