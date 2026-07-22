import system from 'system';

import { createBinding as bind } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

import Mpris from 'gi://AstalMpris';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';

import { LucideIcon } from '../../../../lib/lucide';
import { fetchYouTubeThumbnail } from '../../../../services/mpris';
import { closeAllControlCenters, focusWindow } from '../../../../services/windowManager';
import CavaWidget from './CavaWidget';

function updatePicture(pic: Gtk.Picture, artUrl: string | null) {
  if (!pic) return;
  if (!artUrl) {
    pic.set_paintable(null as unknown as Gdk.Paintable);
    return;
  }

  const uri = artUrl.startsWith('file://')
    ? artUrl
    : artUrl.startsWith('/')
      ? `file://${artUrl}`
      : '';
  if (!uri) {
    pic.set_paintable(null as unknown as Gdk.Paintable);
    return;
  }

  try {
    const file = Gio.File.new_for_uri(uri);
    pic.set_paintable(Gdk.Texture.new_from_file(file));
  } catch (e) {
    pic.set_paintable(null as unknown as Gdk.Paintable);
    console.error(e);
  }
}

export default function PlayerCard({
  player,
  onSwitch,
  name,
}: {
  player: Mpris.Player;
  onSwitch: () => void;
  name: string;
}) {
  const pic = new Gtk.Picture({
    contentFit: Gtk.ContentFit.COVER,
    canFocus: false,
    canShrink: true,
  });
  const picRef = pic;

  const updateImg = async () => {
    try {
      const ytArt = await fetchYouTubeThumbnail(player);
      updatePicture(picRef, ytArt || player.cover_art);
    } catch (e) {
      console.error(e);
      updatePicture(picRef, player.cover_art);
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

  return (
    <overlay
      name={name}
      cssClasses={['cc-media-card']}
      onDestroy={() => {
        player.disconnect(hook);
        if (picRef) picRef.set_paintable(null as unknown as Gdk.Paintable);
      }}
      $={(self: Gtk.Overlay) => {
        const cavaContainer = (
          <box heightRequest={160} hexpand={true}>
            <CavaWidget />
          </box>
        ) as Gtk.Widget;
        self.set_child(cavaContainer);

        const controlsBox = (
          <box spacing={16} css="padding: 16px;" hexpand={true}>
            <box
              valign={Gtk.Align.CENTER}
              css="border-radius: 12px;"
              widthRequest={80}
              heightRequest={80}
              overflow={Gtk.Overflow.HIDDEN}
            >
              <overlay
                $={(artOverlay: Gtk.Overlay) => {
                  const dummyBox = (<box widthRequest={80} heightRequest={80} />) as Gtk.Widget;
                  artOverlay.set_child(dummyBox);

                  const artScroll = (
                    <scrolledwindow
                      hscrollbarPolicy={Gtk.PolicyType.NEVER}
                      vscrollbarPolicy={Gtk.PolicyType.NEVER}
                      propagateNaturalWidth={false}
                      propagateNaturalHeight={false}
                      widthRequest={80}
                      heightRequest={80}
                    >
                      {pic}
                    </scrolledwindow>
                  ) as Gtk.Widget;
                  artOverlay.add_overlay(artScroll);
                }}
              />
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
                <revealer
                  transitionType={Gtk.RevealerTransitionType.SLIDE_RIGHT}
                  revealChild={bind(Mpris.get_default(), 'players').as((p) => p.length > 1)}
                >
                  <button class="icon-btn" onClicked={onSwitch} tooltipText="Switch Player">
                    <LucideIcon name="arrow-right-left" pixelSize={18} />
                  </button>
                </revealer>
              </box>
            </box>
          </box>
        ) as Gtk.Widget;
        self.add_overlay(controlsBox);
      }}
    />
  );
}
