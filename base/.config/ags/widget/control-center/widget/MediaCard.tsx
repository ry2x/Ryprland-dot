import system from 'system';

import { For, createBinding as bind } from 'ags';
import { Gdk, Gtk } from 'ags/gtk4';

import AstalCava from 'gi://AstalCava';
import Mpris from 'gi://AstalMpris';
import Gio from 'gi://Gio';
import Pango from 'gi://Pango';

import { LucideIcon } from '../../../lib/lucide';
import { focusWindow } from '../../../services/windowManager';
import CavaWidget from './CavaWidget';

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

      <For each={bind(mpris, 'players').as((p) => p.slice(0, 1))}>
        {(player: Mpris.Player) => {
          const overlay = new Gtk.Overlay();
          const dummyBox = new Gtk.Box();
          dummyBox.set_size_request(80, 80);
          overlay.set_child(dummyBox);

          const pic = new Gtk.Picture();
          pic.set_content_fit(Gtk.ContentFit.COVER);
          pic.set_can_focus(false);
          pic.set_can_shrink(true);

          // Wrap picture in ScrolledWindow to trap its massive natural size
          const artScroll = new Gtk.ScrolledWindow();
          artScroll.set_policy(Gtk.PolicyType.NEVER, Gtk.PolicyType.NEVER);
          artScroll.set_propagate_natural_width(false);
          artScroll.set_propagate_natural_height(false);
          artScroll.set_size_request(80, 80);
          artScroll.set_child(pic);

          overlay.add_overlay(artScroll);

          const updateImg = () => {
            const art = player.cover_art;
            if (art) {
              const uri = art.startsWith('file://')
                ? art
                : art.startsWith('/')
                  ? `file://${art}`
                  : '';
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

          return (() => {
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
                        const { closeAllControlCenters } = await import("../../../services/windowManager");
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
          })();
        }}
      </For>
    </box>
  );
}
