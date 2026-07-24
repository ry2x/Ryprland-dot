import { createState } from 'ags';
import { exec, execAsync } from 'ags/process';

import Hyprland from 'gi://AstalHyprland';
import Wp from 'gi://AstalWp';
import GLib from 'gi://GLib';

import { sendNotification } from '../lib/notification';
import { appConfig } from './config';

export const [isRecording, setIsRecording] = createState(false);

setInterval(() => {
  try {
    exec('pgrep wf-recorder');
    setIsRecording(true);
  } catch {
    setIsRecording(false);
  }
}, 2000);

export async function startRecord(mode: 'monitor' | 'slurp') {
  try {
    if (isRecording()) return;

    const now = GLib.DateTime.new_now_local();
    const format = appConfig.recorder?.filenameFormat || 'recording_%Y-%m-%d_%H.%M.%S.mp4';
    const filename = now.format(format) || `recording_${Date.now()}.mp4`;

    let savePath = appConfig.recorder?.savePath || '~/Videos';
    if (savePath.startsWith('~')) {
      savePath = savePath.replace(/^~/, GLib.get_home_dir());
    }

    if (GLib.mkdir_with_parents(savePath, 0o755) === -1) {
      console.error(`Failed to create directory: ${savePath}`);
    }

    const fullPath = `${savePath}/${filename}`;

    const cmd = ['wf-recorder', '--pixel-format', 'yuv420p', '-f', fullPath, '-t'];

    if (appConfig.recorder?.recordAudio !== false) {
      if (appConfig.recorder?.audioSource === 'mic') {
        cmd.push('-a');
      } else {
        const speaker = Wp.get_default().audio.get_default_speaker();
        if (speaker) {
          cmd.push(`--audio=${speaker.name?.trim()}.monitor`);
        } else {
          cmd.push('-a');
        }
      }
    }

    if (mode === 'monitor') {
      const monitor = Hyprland.get_default().get_focused_monitor();
      if (monitor) {
        cmd.push('-o', monitor.name);
      } else {
        console.error('No focused monitor found for recording');
      }
    } else if (mode === 'slurp') {
      try {
        const region = await execAsync('slurp');
        cmd.push('--geometry', region.trim());
      } catch (e) {
        console.warn('Cancelled Slurp [This is not an error. Emit by user operation]', e);
        sendNotification({
          summary: 'Recording cancelled',
          body: 'Selection was cancelled',
          app_name: 'Recorder',
        });
        return;
      }
    }

    const bashCmd = cmd.map((c) => (typeof c === 'string' ? `'${c}'` : c)).join(' ');
    execAsync(['bash', '-c', `${bashCmd} & disown`]).catch(console.error);
    sendNotification({
      summary: 'Recording started',
      body: `Recording to ${fullPath}`,
      app_name: 'Recorder',
    });
    setIsRecording(true);
  } catch (e) {
    console.error('Failed to start recording', e);
  }
}

export function stopRecord() {
  if (isRecording()) {
    execAsync('pkill wf-recorder').catch(console.error);
    sendNotification({
      summary: 'Recording stopped',
      body: 'Recording has been stopped',
      app_name: 'Recorder',
    });
    setIsRecording(false);
  }
}
