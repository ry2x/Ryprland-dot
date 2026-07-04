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
          overlay.add_overlay(pic);

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
                  // eslint-disable-next-line @typescript-eslint/no-explicit-any
                  pic.set_paintable(null as any);
                  console.error(e);
                }
              } else {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pic.set_paintable(null as any);
              }
            } else {
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              pic.set_paintable(null as any);
            }

            // Force JS GC to immediately collect the unmounted old texture wrapper,
            // freeing the 5-10MB native GTK texture instantly.
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
            <box
              class="cc-card"
              orientation={Gtk.Orientation.VERTICAL}
              css="padding: 0;"
              heightRequest={160}
              onDestroy={() => {
                player.disconnect(hook);
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                pic.set_paintable(null as any);
              }}
            >
              {/* CAVA (Drawn First -> Background) */}
              <CavaWidget />

              <box spacing={16} css="padding: 16px;" vexpand={true}>
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
                    onClicked={() => {
                      try {
                        player.raise();
                      } catch (e) {
                        console.error(e);
                      }
                      if (player.entry) {
                        focusWindow(player.entry);
                      }
                    }}
                  >
                    <label
                      label={bind(player, 'title').as((t) => t || 'Unknown')}
                      css="font-weight: 800; font-size: 1.2em;"
                      halign={Gtk.Align.START}
                      wrap={true}
                      wrapMode={Pango.WrapMode.WORD_CHAR}
                      maxWidthChars={20}
                      lines={2}
                      ellipsize={Pango.EllipsizeMode.END}
                    />
                  </button>
                  <label
                    label={bind(player, 'artist').as((a) => a || 'Unknown')}
                    css="opacity: 0.7; font-size: 0.9em; margin-bottom: 4px;"
                    halign={Gtk.Align.START}
                    wrap={true}
                    wrapMode={Pango.WrapMode.WORD_CHAR}
                    maxWidthChars={25}
                    lines={1}
                    ellipsize={Pango.EllipsizeMode.END}
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
            </box>
          );
        }}
      </For>
    </box>
  );
}
