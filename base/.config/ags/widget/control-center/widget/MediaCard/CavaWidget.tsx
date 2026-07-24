import { Gtk } from 'ags/gtk4';

import AstalCava from 'gi://AstalCava';

export default function CavaWidget() {
  const cava = AstalCava.get_default();
  if (!cava) return <box visible={false} />;

  const area = new Gtk.DrawingArea();
  area.set_size_request(-1, 160);
  area.set_hexpand(true);
  area.set_valign(Gtk.Align.END);

  const signalId = cava.connect('notify::values', () => {
    area.queue_draw();
  });

  area.connect('destroy', () => {
    cava.disconnect(signalId);
  });

  let cachedColor = { r: 1, g: 1, b: 1, a: 0.15 };
  let frameCount = 0;

  area.set_draw_func((_area, cr, width, height) => {
    const vals = cava.values.slice(0, 30);
    if (vals.length === 0) return;

    const SENSITIVITY = 1.5;
    const barWidth = width / vals.length;
    const padding = 2;

    if (frameCount % 60 === 0) {
      const c = _area.get_style_context().get_color();
      cachedColor = { r: c.red, g: c.green, b: c.blue, a: 0.15 };
    }
    frameCount++;

    cr.setSourceRGBA(cachedColor.r, cachedColor.g, cachedColor.b, cachedColor.a);

    for (let i = 0; i < vals.length; i++) {
      const val = Math.min(vals[i] * SENSITIVITY, 1.0);
      const barHeight = Math.max(val * height, 2);
      cr.rectangle(i * barWidth + padding / 2, height - barHeight, barWidth - padding, barHeight);
      cr.fill();
    }

    if (typeof (cr as { $dispose?: () => void }).$dispose === 'function') {
      (cr as { $dispose: () => void }).$dispose();
    }
  });

  return (
    <box
      class="cava-visualizer"
      css="margin-left: 12px; margin-right: 12px; margin-bottom: 1px;"
      canTarget={false}
    >
      {area}
    </box>
  );
}
