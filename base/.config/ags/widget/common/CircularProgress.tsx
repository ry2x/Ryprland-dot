import { Gtk } from 'ags/gtk4';

import { LucideIcon } from '../../lib/lucide';

export default function CircularProgress<T>({
  variable,
  transformer,
  icon,
  label,
  sublabel,
  cssClass,
}: {
  variable: { get: () => T; subscribe: (fn: () => void) => void };
  transformer: (v: T) => number;
  icon: string;
  label: string;
  sublabel: string | unknown;
  cssClass: string;
}) {
  const area = new Gtk.DrawingArea();
  area.add_css_class(cssClass);
  area.set_content_width(120);
  area.set_content_height(120);
  area.set_size_request(120, 120);

  let currentValue = transformer(variable.get());
  variable.subscribe(() => {
    currentValue = transformer(variable.get());
    area.queue_draw();
  });

  area.set_draw_func((_area, cr, width, height) => {
    const ctx = _area.get_style_context();
    const color = ctx.get_color();
    const r = color.red;
    const g = color.green;
    const b = color.blue;

    const center_x = width / 2;
    const center_y = height / 2;
    const radius = Math.min(width, height) / 2 - 6;

    const safeValue = isNaN(currentValue) ? 0 : Math.max(0, Math.min(1, currentValue));

    cr.setSourceRGBA(r, g, b, 0.15);
    cr.setLineWidth(6);
    cr.arc(center_x, center_y, radius, 0, 2 * Math.PI);
    cr.stroke();

    if (safeValue > 0) {
      cr.setSourceRGBA(r, g, b, 1.0);
      cr.setLineWidth(6);
      cr.setLineCap(1); // ROUND
      cr.arc(center_x, center_y, radius, 1.5 * Math.PI, 1.5 * Math.PI + safeValue * 2 * Math.PI);
      cr.stroke();
    }
  });

  const overlay = new Gtk.Overlay();
  overlay.set_child(area);

  const textContainer = (
    <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER} halign={Gtk.Align.CENTER}>
      <box spacing={6} valign={Gtk.Align.CENTER} class={cssClass}>
        <LucideIcon name={icon} pixelSize={14} />
        <label
          label={label}
          css={`
            font-weight: 800;
            font-size: 14px;
          `}
        />
      </box>
      <label
        label={sublabel as string}
        css="opacity: 0.7; font-weight: 700; font-size: 11px; margin-top: 2px;"
      />
    </box>
  );

  overlay.add_overlay(textContainer as Gtk.Widget);

  return overlay;
}
