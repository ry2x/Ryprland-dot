import { Gtk } from 'ags/gtk4';
import { execAsync } from 'ags/process';
import { createPoll } from 'ags/time';

import GLib from 'gi://GLib?version=2.0';

import { appConfig } from '../../../services/config';
import { getOsInfo, userName } from '../../../services/system';

const uptime = createPoll('0m', 60000, () =>
  execAsync(['bash', '-c', 'uptime -p']).catch(() => 'up 0 mins'),
);

const osInfoCache = getOsInfo();

export default function ProfileCard() {
  const profile = appConfig.profile || {};
  let avatarPath = profile.avatarPath || '/home/haku/Profile/Profile.png';
  if (avatarPath.startsWith('~/')) {
    avatarPath = GLib.get_home_dir() + avatarPath.slice(1);
  }
  const handle = profile.handle || userName;
  const osInfo = profile.os || osInfoCache;

  return (
    <box class="profile-card widget-card" spacing={16} orientation={Gtk.Orientation.HORIZONTAL}>
      {/* Left: Avatar Area */}
      <box
        class="profile-avatar"
        css={`
          background-image: url('file://${avatarPath}');
          background-size: cover;
          background-position: center;
          border-radius: 50%;
          min-width: 64px;
          min-height: 64px;
        `}
      />

      {/* Right: Information Area */}
      <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} spacing={4}>
        <label label={handle} class="profile-name" halign={Gtk.Align.START} />
        <label label={osInfo} class="profile-env" halign={Gtk.Align.START} />
        <label
          label={uptime.as((u) => `Uptime: ${u.replace('up ', '')}`)}
          class="profile-uptime"
          halign={Gtk.Align.START}
        />
      </box>
    </box>
  );
}
