import { createState } from 'ags';
import { exec, execAsync } from 'ags/process';

import GLib from 'gi://GLib';

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

// eslint-disable-next-line complexity
export async function startRecord(mode: 'monitor' | 'slurp') {
  if (isRecording()) return;

  const now = GLib.DateTime.new_now_local();
  const format = appConfig.recorder?.filenameFormat || 'recording_%Y-%m-%d_%H.%M.%S.mp4';
  const filename = now.format(format) || `recording_${Date.now()}.mp4`;

  let savePath = appConfig.recorder?.savePath || '~/Videos';
  if (savePath.startsWith('~')) {
    savePath = savePath.replace(/^~/, GLib.get_home_dir());
  }

  try {
    exec(`mkdir -p ${savePath}`);
  } catch (e) {
    console.error('mkdir error', e);
  }

  const fullPath = `${savePath}/${filename}`;

  const cmd = ['wf-recorder', '--pixel-format', 'yuv420p', '-f', fullPath, '-t'];

  if (appConfig.recorder?.recordAudio !== false) {
    if (appConfig.recorder?.audioSource === 'mic') {
      cmd.push('-a');
    } else {
      // Default to system
      try {
        const sink = await execAsync('pactl get-default-sink');
        if (sink) {
          cmd.push(`--audio=${sink.trim()}.monitor`);
        } else {
          cmd.push('-a');
        }
      } catch (e) {
        console.error('Failed to get default sink for audio recording', e);
        cmd.push('-a');
      }
    }
  }

  if (mode === 'monitor') {
    try {
      const monitorsStr = await execAsync('hyprctl monitors -j');
      const monitors = JSON.parse(monitorsStr);
      const active = monitors.find((m: { focused: boolean; name: string }) => m.focused)?.name;
      if (active) {
        cmd.push('-o', active);
      }
    } catch (e) {
      console.error('Failed to get active monitor', e);
    }
  } else if (mode === 'slurp') {
    try {
      const region = await execAsync('slurp');
      cmd.push('--geometry', region.trim());
    } catch (e) {
      console.warn('Cancelled Slurp', e);
      execAsync([
        'notify-send',
        'Recording cancelled',
        'Selection was cancelled',
        '-a',
        'Recorder',
      ]).catch(console.error);
      return;
    }
  }

  const bashCmd = cmd.map((c) => (typeof c === 'string' ? `'${c}'` : c)).join(' ');
  execAsync(['bash', '-c', `${bashCmd} & disown`]).catch(console.error);
  execAsync(['notify-send', 'Starting recording', filename, '-a', 'Recorder']).catch(console.error);
  setIsRecording(true);
}

export function stopRecord() {
  if (isRecording()) {
    execAsync('pkill wf-recorder').catch(console.error);
    execAsync(['notify-send', 'Recording Stopped', 'Stopped', '-a', 'Recorder']).catch(
      console.error,
    );
    setIsRecording(false);
  }
}
