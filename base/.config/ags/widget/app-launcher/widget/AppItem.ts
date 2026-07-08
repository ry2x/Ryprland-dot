import { Gtk } from 'ags/gtk4';

import Apps from 'gi://AstalApps';
import Pango from 'gi://Pango';

import { recordAppLaunch } from '../../../services/apps';
import { toggleAppLauncher } from '../../../services/windowManager';

export function createAppItem(res: Apps.Application, monitorConnector: string | null) {
  const btn = new Gtk.Button({
    cssClasses: ['applauncher-item'],
    canFocus: false,
  });

  const box = new Gtk.Box({
    orientation: Gtk.Orientation.HORIZONTAL,
    spacing: 12,
  });

  const iconStr = res.iconName || 'application-x-executable';
  const iconProps: { cssClasses: string[]; file?: string; iconName?: string } = {
    cssClasses: ['applauncher-item-icon'],
  };

  if (iconStr.startsWith('/')) {
    iconProps.file = iconStr;
  } else {
    iconProps.iconName = iconStr;
  }

  const icon = new Gtk.Image(iconProps);

  const textBox = new Gtk.Box({
    orientation: Gtk.Orientation.VERTICAL,
    valign: Gtk.Align.CENTER,
  });

  const nameLabel = new Gtk.Label({
    label: res.name,
    halign: Gtk.Align.START,
    cssClasses: ['applauncher-item-name'],
  });

  textBox.append(nameLabel);

  if (res.description) {
    const descLabel = new Gtk.Label({
      label: res.description,
      halign: Gtk.Align.START,
      cssClasses: ['applauncher-item-desc'],
      ellipsize: Pango.EllipsizeMode.END,
      maxWidthChars: 40,
    });
    textBox.append(descLabel);
  }

  box.append(icon);
  box.append(textBox);
  btn.set_child(box);

  btn.connect('clicked', () => {
    toggleAppLauncher(monitorConnector);
    recordAppLaunch(res);
    res.launch();
  });

  return btn;
}
