import { Gtk } from 'ags/gtk4';

import { appConfig } from '../../../services/config';
import { clockTime } from '../../../services/time';

const WORLD_CLOCKS = appConfig.worldClocks;

export default function WorldClockCard() {
  return (
    <box
      class="world-clock-card widget-card"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
      hexpand
    >
      {WORLD_CLOCKS.map((tz) => (
        <box orientation={Gtk.Orientation.VERTICAL} halign={Gtk.Align.FILL} spacing={2}>
          <box orientation={Gtk.Orientation.HORIZONTAL} halign={Gtk.Align.FILL}>
            <label label={tz.label} halign={Gtk.Align.START} hexpand class="world-clock-label" />
            <label
              halign={Gtk.Align.END}
              css="font-weight: 700; font-size: 1.1em;"
              label={clockTime.as(() => {
                const now = new Date();
                return now.toLocaleTimeString('en-US', {
                  timeZone: tz.tz,
                  hour: '2-digit',
                  minute: '2-digit',
                  hour12: false,
                });
              })}
            />
          </box>
          <label
            halign={Gtk.Align.START}
            css="color: alpha(currentColor, 0.7); font-size: 0.85em;"
            label={clockTime.as(() => {
              const now = new Date();
              const date = now.toLocaleDateString('en-US', {
                timeZone: tz.tz,
                month: 'short',
                day: '2-digit',
              });
              const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: tz.tz,
                timeZoneName: 'shortOffset',
              }).formatToParts(now);
              const offsetPart = parts.find((p) => p.type === 'timeZoneName')?.value || '';
              let offset = offsetPart.replace('GMT', '');
              if (offset === '') offset = '+0';
              const tzAbbrParts = new Intl.DateTimeFormat('en-US', {
                timeZone: tz.tz,
                timeZoneName: 'short',
              }).formatToParts(now);
              const tzAbbr = tzAbbrParts.find((p) => p.type === 'timeZoneName')?.value || '';
              return `${date} | ${offset}h | ${tzAbbr}`;
            })}
          />
        </box>
      ))}
    </box>
  );
}
