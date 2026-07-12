import system from 'system';

import { createBinding as bind } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';
import { execAsync } from 'ags/process';

import AstalCava from 'gi://AstalCava';
import Mpris from 'gi://AstalMpris';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';

import { LucideIcon } from '../../../lib/lucide';
import { focusWindow } from '../../../services/windowManager';
import CavaWidget from './CavaWidget';

function createPlayerCard(player: Mpris.Player, total: number, onSwitch: () => void) {
  const overlay = new Gtk.Overlay();
  const dummyBox = new Gtk.Box();
  dummyBox.set_size_request(80, 80);
  overlay.set_child(dummyBox);

  const pic = new Gtk.Picture();
  pic.set_content_fit(Gtk.ContentFit.COVER);
  pic.set_can_focus(false);
  pic.set_can_shrink(true);

  const artScroll = new Gtk.ScrolledWindow();
  artScroll.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
  artScroll.set_propagate_natural_width(false);
  artScroll.set_propagate_natural_height(false);
  artScroll.set_size_request(80, 80);
  artScroll.set_child(pic);

  overlay.add_overlay(artScroll);

  const updateImg = async () => {
    let art = player.cover_art;

    try {
      const busName = player.bus_name;
      if (busName) {
        const playerName = busName.replace('org.mpris.MediaPlayer2.', '');
        const url = await execAsync(`playerctl -p ${playerName} metadata xesam:url`);

        if (url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')) {
          let id = '';
          if (url.includes('youtu.be/')) {
            id = url.split('youtu.be/')[1].split('?')[0];
          } else {
            const match = url.match(/v=([^&]*)/);
            if (match) id = match[1];
          }

          if (id) {
            const cacheDir = `${GLib.get_user_cache_dir()}/ags/media`;
            const localPath = `${cacheDir}/${id}.jpg`;

            if (!GLib.file_test(localPath, GLib.FileTest.EXISTS)) {
              await execAsync(`mkdir -p ${cacheDir}`);
              await execAsync(
                `curl -s -o ${localPath} https://img.youtube.com/vi/${id}/maxresdefault.jpg`,
              );
            }
            art = `file://${localPath}`;
          }
        }
      }
    } catch (e) {
      // playerctl command failed or not a youtube url, fallback to default art
      console.error(e);
    }

    if (art) {
      const uri = art.startsWith('file://') ? art : art.startsWith('/') ? `file://${art}` : '';
      if (uri) {
        try {
          const file = Gio.File.new_for_uri(uri);
          pic.set_paintable(Gdk.Texture.new_from_file(file));
        } catch (e) {
          pic.set_paintable(null as unknown as Gdk.Paintable);
          console.error(e);
        }
      } else {
        pic.set_paintable(null as unknown as Gdk.Paintable);
      }
    } else {
      pic.set_paintable(null as unknown as Gdk.Paintable);
    }
    setTimeout(() => {
      try {
        system.gc();
      } catch (e) {
        console.error(e);
      }
    }, 100);
  };
  const hook = player.connect('notify::cover-art', updateImg);
  updateImg();

  const cardOverlay = Object.assign(new Gtk.Overlay(), {
    cssClasses: ['cc-media-card'],
  }) as Gtk.Overlay;

  const cavaContainer = (
    <box heightRequest={160} hexpand={true}>
      <CavaWidget />
    </box>
  ) as Gtk.Box;
  cardOverlay.set_child(cavaContainer);

  const controlsBox = (
    <box spacing={16} css="padding: 16px;" hexpand={true}>
      <box
        valign={Gtk.Align.CENTER}
        css="border-radius: 12px; min-width: 80px; min-height: 80px;"
        overflow={Gtk.Overflow.HIDDEN}
      >
        {overlay}
      </box>
      <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} hexpand>
        <button
          css="background: transparent; border: none; box-shadow: none; padding: 0;"
          halign={Gtk.Align.START}
          onClicked={async () => {
            try {
              player.raise();
            } catch (e) {
              console.error(e);
            }
            if (player.entry) {
              focusWindow(player.entry);
              const { closeAllControlCenters } = await import('../../../services/windowManager');
              closeAllControlCenters();
            }
          }}
        >
          <label
            label={bind(player, 'title').as((t) => t || 'Unknown')}
            css="font-weight: 800; font-size: 1.2em;"
            halign={Gtk.Align.START}
            wrap={true}
            wrapMode={Pango.WrapMode.WORD_CHAR}
            maxWidthChars={18}
            lines={2}
            ellipsize={Pango.EllipsizeMode.END}
          />
        </button>
        <label
          label={bind(player, 'artist').as((a) => a || 'Unknown')}
          css="opacity: 0.7; font-size: 0.9em; margin-bottom: 4px;"
          halign={Gtk.Align.START}
          ellipsize={Pango.EllipsizeMode.END}
          maxWidthChars={20}
          lines={1}
        />

        <box spacing={16} halign={Gtk.Align.START}>
          <button class="icon-btn" onClicked={() => player.previous()}>
            <LucideIcon name="skip-back" pixelSize={20} />
          </button>
          <button class="icon-btn" onClicked={() => player.play_pause()}>
            <LucideIcon
              name={bind(player, 'playback_status').as((s) =>
                s === Mpris.PlaybackStatus.PLAYING ? 'pause' : 'play',
              )}
              pixelSize={20}
            />
          </button>
          <button class="icon-btn" onClicked={() => player.next()}>
            <LucideIcon name="skip-forward" pixelSize={20} />
          </button>
          {total > 1 ? (
            <button class="icon-btn" onClicked={onSwitch} tooltipText="Switch Player">
              <LucideIcon name="arrow-right-left" pixelSize={18} />
            </button>
          ) : null}
        </box>
      </box>
    </box>
  ) as Gtk.Box;
  cardOverlay.add_overlay(controlsBox);

  cardOverlay.connect('destroy', () => {
    player.disconnect(hook);
    pic.set_paintable(null as unknown as Gdk.Paintable);
  });

  return cardOverlay;
}

export default function MediaCard() {
  const mpris = Mpris.get_default();
  const cava = AstalCava.get_default();
  if (cava) {
    cava.bars = 16;
    cava.stereo = false;
  }

  return (
    <box class="cc-media-container" orientation={Gtk.Orientation.VERTICAL} spacing={8}>
      <box
        visible={bind(mpris, 'players').as((p) => p.length === 0)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        css="min-height: 160px;"
      >
        <label label="No Media Playing" css="color: alpha(currentColor, 0.5); font-weight: 700;" />
      </box>

      <stack
        transitionType={Gtk.StackTransitionType.CROSSFADE}
        transitionDuration={250}
        $={(self: Gtk.Stack) => {
          let currentIndex = 0;
          let activePlayers: Mpris.Player[] = [];

          const updateStack = () => {
            const players = mpris.get_players();
            activePlayers = players;

            // Remove existing
            let child = self.get_first_child();
            while (child) {
              const next = child.get_next_sibling();
              self.remove(child);
              child = next;
            }

            if (players.length === 0) return;

            if (currentIndex >= players.length) {
              currentIndex = Math.max(0, players.length - 1);
            }

            players.forEach((player, i) => {
              const onSwitch = () => {
                if (activePlayers.length > 1) {
                  currentIndex = (currentIndex + 1) % activePlayers.length;
                  self.set_visible_child_name(`player-${currentIndex}`);
                }
              };
              const card = createPlayerCard(player, players.length, onSwitch);
              self.add_named(card, `player-${i}`);
            });

            self.set_visible_child_name(`player-${currentIndex}`);
          };

          mpris.connect('notify::players', updateStack);
          updateStack();
        }}
      />
    </box>
  );
}
