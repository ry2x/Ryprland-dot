import { Astal, Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import GLib from 'gi://GLib';
import Cairo from 'gi://cairo';

// --- State for expanding bar animation ---
import { activeSidePanel, setAnimDx } from '../../services/windowManager';
import Clock from './widget/Clock';
import ScrollerIndicator from './widget/ScrollerIndicator';
import SysMetrics from './widget/SysMetrics';
import Tray from './widget/Tray';
import Updates from './widget/Updates';
import Volume from './widget/Volume';
import Weather from './widget/Weather';
import Workspaces from './widget/Workspaces';

// --- Config ---
const BORDER_WIDTH = 3;
const BAR_WIDTH = 47;
const MATUGEN_PATH = `${GLib.get_user_config_dir()}/ags/themes/matugen.scss`;

// --- Color parsing ---
function hexToRgba(hex: string): [number, number, number, number] {
  hex = hex.replace('#', '');
  if (hex.length === 6) {
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
      1,
    ];
  }
  if (hex.length === 8) {
    return [
      parseInt(hex.slice(0, 2), 16) / 255,
      parseInt(hex.slice(2, 4), 16) / 255,
      parseInt(hex.slice(4, 6), 16) / 255,
      parseInt(hex.slice(6, 8), 16) / 255,
    ];
  }
  return [0.1, 0.07, 0.08, 1];
}

function readMatugenColors(): { surface: string; primary: string } {
  try {
    const [ok, bytes] = GLib.file_get_contents(MATUGEN_PATH);
    if (!ok || !bytes) throw new Error('read failed');
    const contents = new TextDecoder().decode(bytes);

    let surface = '#191114';
    let primary = '#ffb0ce';

    for (const line of contents.split('\n')) {
      const trimmed = line.trim();
      const sm = trimmed.match(/^\$surface:\s*(#[0-9a-fA-F]{6})/);
      if (sm) surface = sm[1];
      const pm = trimmed.match(/^\$primary:\s*(#[0-9a-fA-F]{6})/);
      if (pm) primary = pm[1];
    }
    console.log(`[Bar] matugen colors: surface=${surface}, primary=${primary}`);
    return { surface, primary };
  } catch (e) {
    console.error(`[Bar] Failed to read matugen.scss: ${e}`);
    return { surface: '#191114', primary: '#ffb0ce' };
  }
}

// --- Module-level state (survives GC) ---
let currentColors = readMatugenColors();
const drawingAreas: Gtk.DrawingArea[] = [];

export function forceRedrawBar() {
  console.log('[Bar] Triggered manual color reload');
  currentColors = readMatugenColors();
  for (const da of drawingAreas) {
    da.queue_draw();
  }
}

function getBgRgba(): [number, number, number, number] {
  const [r, g, b] = hexToRgba(currentColors.surface);
  return [r, g, b, 0.75];
}

function getAccentRgba(): [number, number, number, number] {
  return hexToRgba(currentColors.primary);
}

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP, BOTTOM, LEFT, RIGHT } = Astal.WindowAnchor;

  let targetDx = BAR_WIDTH;
  let currentDx = BAR_WIDTH;
  let animTickId = 0;

  activeSidePanel.subscribe(({ panel, monitor }) => {
    // Only expand the bar on the monitor where the panel is active.
    if (monitor === gdkmonitor.get_connector() || monitor === '') {
      if (panel === 'control-center') {
        targetDx = BAR_WIDTH + 490;
      } else if (panel === 'date-weather') {
        targetDx = BAR_WIDTH + 900;
      } else {
        targetDx = BAR_WIDTH;
      }

      if (animTickId === 0) {
        animTickId = GLib.timeout_add(GLib.PRIORITY_DEFAULT, 1000 / 60, () => {
          const diff = targetDx - currentDx;
          if (Math.abs(diff) < 1.0) {
            currentDx = targetDx;
            setAnimDx(targetDx);
            animTickId = 0;
            for (const da of drawingAreas) da.queue_draw();
            return GLib.SOURCE_REMOVE;
          }
          // Simple ease-out
          const speed = 0.15;

          currentDx += diff * speed;
          setAnimDx(currentDx);
          for (const da of drawingAreas) da.queue_draw();
          return GLib.SOURCE_CONTINUE;
        });
      }
    }
  });

  return (
    <window
      visible
      name={`bar-${gdkmonitor.get_connector()}`}
      cssClasses={['Bar']}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.IGNORE}
      layer={Astal.Layer.TOP}
      anchor={TOP | BOTTOM | LEFT | RIGHT}
      application={app}
      $={(self) => {
        GLib.timeout_add(GLib.PRIORITY_DEFAULT, 500, () => {
          const surf = self.get_native()?.get_surface();
          if (surf) {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const Region = (Cairo as any).Region;
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const RectangleInt = (Cairo as any).RectangleInt;
            const region = new Region();
            // We only need the left bar clickable initially,
            // but the side panels handle their own clicks, so it's fine.
            region.unionRectangle(
              new RectangleInt({ x: 0, y: 0, width: BAR_WIDTH + BORDER_WIDTH, height: 9999 }),
            );
            surf.set_input_region(region);
          }
          return GLib.SOURCE_REMOVE;
        });
      }}
    >
      <overlay
        hexpand
        vexpand
        $={(overlay) => {
          overlay.add_overlay(
            (
              <box halign={Gtk.Align.START}>
                <centerbox
                  class="panel"
                  orientation={Gtk.Orientation.VERTICAL}
                  startWidget={
                    (
                      <box
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.START}
                        class="panel-start"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={24}
                      >
                        <Workspaces gdkmonitor={gdkmonitor} />
                        <ScrollerIndicator gdkmonitor={gdkmonitor} />
                      </box>
                    ) as Gtk.Widget
                  }
                  centerWidget={
                    (
                      <box
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.CENTER}
                        class="panel-center"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={8}
                      >
                        <Weather gdkmonitor={gdkmonitor} />
                        <Clock gdkmonitor={gdkmonitor} />
                      </box>
                    ) as Gtk.Widget
                  }
                  endWidget={
                    (
                      <box
                        halign={Gtk.Align.FILL}
                        valign={Gtk.Align.END}
                        class="panel-end"
                        orientation={Gtk.Orientation.VERTICAL}
                        spacing={8}
                      >
                        <Updates gdkmonitor={gdkmonitor} />
                        <SysMetrics gdkmonitor={gdkmonitor} />
                        <Volume gdkmonitor={gdkmonitor} />
                        <Tray />
                      </box>
                    ) as Gtk.Widget
                  }
                />
              </box>
            ) as Gtk.Widget,
          );
        }}
      >
        <drawingarea
          hexpand
          vexpand
          canTarget={false}
          canFocus={false}
          sensitive={false}
          $={(da: Gtk.DrawingArea) => {
            drawingAreas.push(da);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            da.set_draw_func((_area, ctx: any, w: number, h: number) => {
              const [bgR, bgG, bgB, bgA] = getBgRgba();
              const [bR, bG, bB, bA] = getAccentRgba();

              ctx.setAntialias(Cairo.Antialias.BEST);

              const bw = BORDER_WIDTH;
              const halfBw = bw / 2.0;
              const r = 16; // border radius

              // Desktop area rectangle (inset by half border width so stroke is fully visible)
              const dx = currentDx + halfBw;
              const dy = halfBw;
              const dw = w - currentDx - bw;
              const dh = h - bw;

              // 1. Fill entire screen with background color
              ctx.setOperator(Cairo.Operator.OVER);
              ctx.setSourceRGBA(bgR, bgG, bgB, bgA);
              ctx.rectangle(0, 0, w, h);
              ctx.fill();

              // Path for desktop hole
              ctx.newPath();
              ctx.arc(dx + dw - r, dy + r, r, -Math.PI / 2, 0); // Top-right corner
              ctx.arc(dx + dw - r, dy + dh - r, r, 0, Math.PI / 2); // Bottom-right corner
              ctx.arc(dx + r, dy + dh - r, r, Math.PI / 2, Math.PI); // Bottom-left corner
              ctx.arc(dx + r, dy + r, r, Math.PI, (3 * Math.PI) / 2); // Top-left corner
              ctx.closePath();

              // 2. Clear the desktop hole to show wallpaper/windows underneath
              ctx.setOperator(Cairo.Operator.CLEAR);
              ctx.fillPreserve();

              // 3. Draw the accent border along the path
              ctx.setOperator(Cairo.Operator.OVER);
              ctx.setSourceRGBA(bR, bG, bB, bA);
              ctx.setLineWidth(bw);
              ctx.stroke();
            });
          }}
        />
      </overlay>
    </window>
  );
}
