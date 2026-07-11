import { createBinding as bind } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

import Wp from 'gi://AstalWp';

import { LucideIcon } from '../../../lib/lucide';
import { playVolumeSound } from '../../../services/audio';
import { toggleControlCenter } from '../../../services/windowManager';

export default function Volume({ gdkmonitor }: { gdkmonitor: Gdk.Monitor }) {
  const speaker = Wp.get_default()!.audio.default_speaker!;

  if (!speaker) return <box />;

  const volIcon = bind(speaker, 'volume_icon').as((icon) => {
    if (icon.includes('muted')) return 'volume-x';
    if (icon.includes('high')) return 'volume-2';
    if (icon.includes('medium')) return 'volume-1';
    if (icon.includes('low')) return 'volume';
    return 'volume-x';
  });

  const toggleMenu = () => {
    toggleControlCenter(gdkmonitor.get_connector());
  };

  const btn = (
    <button class="Volume" onClicked={toggleMenu}>
      <box spacing={4} orientation={Gtk.Orientation.VERTICAL}>
        <LucideIcon name={volIcon} class="icon" />
        <box spacing={0} orientation={Gtk.Orientation.VERTICAL}>
          <label label={bind(speaker, 'volume').as((v) => `${Math.round(v * 100)}`)} />
          <label label="%" css="font-size: 0.85em;" />
        </box>
      </box>
    </button>
  ) as Gtk.Button;

  let lastPlay = 0;
  const playSound = () => {
    const now = Date.now();
    if (now - lastPlay > 100) {
      lastPlay = now;
      playVolumeSound();
    }
  };

  const scroll = new Gtk.EventControllerScroll({
    flags: Gtk.EventControllerScrollFlags.VERTICAL,
  });
  scroll.connect('scroll', (_, dx, dy) => {
    if (dy > 0) {
      speaker.volume = Math.max(0, speaker.volume - 0.05);
      playSound();
    } else if (dy < 0) {
      speaker.volume = Math.min(1, speaker.volume + 0.05);
      playSound();
    }
    return true;
  });
  btn.add_controller(scroll);

  return btn;
}
