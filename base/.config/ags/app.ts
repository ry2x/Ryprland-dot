import { Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

import GLib from 'gi://GLib';

import { initCss } from './lib/css';
import { requestHandler } from './lib/requestHandler';
import AppLauncher from './widget/app-launcher';
import Bar from './widget/bar';
import ControlCenter from './widget/control-center';
import DateWeatherPopup from './widget/date-weather';
import NotificationPopups from './widget/notification-popups';

GLib.setenv('GSK_RENDERER', 'gl', true);

app.start({
  requestHandler,
  main() {
    initCss();

    // Add lucide symbolic icons to GTK Icon Theme search path
    const display = Gdk.Display.get_default();
    if (display) {
      Gtk.IconTheme.get_for_display(display).add_search_path(
        `${GLib.get_user_config_dir()}/ags/assets/icons`,
      );
    }

    app.get_monitors().forEach((m) => {
      Bar(m);
      ControlCenter(m);
      DateWeatherPopup(m);
      NotificationPopups(m);
      AppLauncher(m);
    });
  },
});
