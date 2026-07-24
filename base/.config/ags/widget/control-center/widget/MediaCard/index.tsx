import { For, createBinding as bind, createState } from 'ags';
import { Gtk } from 'ags/gtk4';

import AstalCava from 'gi://AstalCava';
import Mpris from 'gi://AstalMpris';

import PlayerCard from './PlayerCard';

export default function MediaCard() {
  const mpris = Mpris.get_default();
  const cava = AstalCava.get_default();
  if (cava) {
    cava.bars = 16;
    cava.stereo = false;
  }

  const [activePlayerBusName, setActivePlayerBusName] = createState('');

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
        visibleChildName={activePlayerBusName.as((b) => b || 'empty')}
        $={(self: Gtk.Stack) => {
          const pages = self.get_pages();
          pages.connect('items-changed', () => {
            let i = 0;
            let page = pages.get_item(i) as Gtk.StackPage | null;
            while (page) {
              const child = page.get_child();
              const name = child.get_name();
              if (name && page.get_name() !== name) {
                page.set_name(name);
              }
              i++;
              page = pages.get_item(i) as Gtk.StackPage | null;
            }
          });

          const updateActivePlayer = () => {
            const players = mpris.get_players();
            if (players.length > 0) {
              if (!players.find((p) => p.bus_name === activePlayerBusName())) {
                setActivePlayerBusName(players[0].bus_name);
              }
            }
          };

          const hook = mpris.connect('notify::players', updateActivePlayer);
          updateActivePlayer();
          self.connect('destroy', () => mpris.disconnect(hook));
        }}
      >
        <For each={bind(mpris, 'players')}>
          {(player: Mpris.Player) => {
            const onSwitch = () => {
              const players = mpris.get_players();
              if (players.length > 1) {
                const idx = players.findIndex((p) => p.bus_name === activePlayerBusName());
                const nextIdx = (idx + 1) % players.length;
                setActivePlayerBusName(players[nextIdx].bus_name);
              }
            };

            return <PlayerCard player={player} onSwitch={onSwitch} name={player.bus_name} />;
          }}
        </For>
      </stack>
    </box>
  );
}
