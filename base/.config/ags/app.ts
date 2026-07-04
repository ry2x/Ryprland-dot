import { Gdk, Gtk } from 'ags/gtk4';
import app from 'ags/gtk4/app';
import { execAsync } from 'ags/process';

import Hyprland from 'gi://AstalHyprland';
import GLib from 'gi://GLib';

import style from './style.scss';

import {
  toggleAppLauncher,
  toggleControlCenter,
  toggleDateWeather,
} from './services/windowManager';
import AppLauncher from './widget/app-launcher';
import Bar from './widget/bar';
import ControlCenter from './widget/control-center';
import DateWeatherPopup from './widget/date-weather';
import NotificationPopups from './widget/notification-popups';

GLib.setenv('GSK_RENDERER', 'gl', true);

let globalCssProvider: Gtk.CssProvider | null = null;

function reloadCss(cssInput: string) {
  if (!globalCssProvider) {
    globalCssProvider = new Gtk.CssProvider();
    const display = Gdk.Display.get_default();
    if (display) {
      Gtk.StyleContext.add_provider_for_display(
        display,
        globalCssProvider,
        Gtk.STYLE_PROVIDER_PRIORITY_USER,
      );
    }
  }

  if (GLib.file_test(cssInput, GLib.FileTest.EXISTS)) {
    globalCssProvider.load_from_path(cssInput);
  } else {
    globalCssProvider.load_from_string(cssInput);
  }
}

app.start({
  requestHandler(request, res) {
    if (request[0] === 'reload-css') {
      const configDir = `${GLib.get_user_config_dir()}/ags`;
      const scssPath = `${configDir}/style.scss`;
      const cssPath = `/tmp/ags-style.css`;

      execAsync(`sass ${scssPath} ${cssPath}`)
        .then(() => {
          reloadCss(cssPath);
          res('CSS Reloaded Successfully');
        })
        .catch((err) => res(`Error: ${err}`));
    } else if (request[0] === 'toggle-notif') {
      toggleDateWeather();
      res('Toggled Notification Center');
    } else if (request[0] === 'toggle-cc') {
      toggleControlCenter();
      res('Toggled Control Center');
    } else if (request[0] === 'toggle-launcher') {
      toggleAppLauncher();
      res('Toggled App Launcher');
    } else if (request[0] === 'list-windows') {
      const focusedMonitor = Hyprland.get_default().get_focused_monitor().name;
      const dw = app.get_window(`date-weather-popup-${focusedMonitor}`);
      res(
        `Focused: ${focusedMonitor} | dw visible: ${dw?.get_visible()} | Windows: ` +
          app
            .get_windows()
            .map((w) => w.name)
            .join(', '),
      );
    } else {
      res(`Unknown command: ${request.join(' ')}`);
    }
  },
  main() {
    reloadCss(style);
    const configDir = `${GLib.get_user_config_dir()}/ags`;
    const scssPath = `${configDir}/style.scss`;
    const cssPath = `/tmp/ags-style.css`;
    execAsync(`sass ${scssPath} ${cssPath}`)
      .then(() => {
        reloadCss(cssPath);
      })
      .catch((err) => console.error(`Error compiling SCSS on startup: ${err}`));

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
