import system from 'system';

import { Gdk, Gtk } from 'ags/gtk4';
import { execAsync } from 'ags/process';

import GLib from 'gi://GLib';

import style from '../style.scss';

import { forceRedrawBar } from '../widget/bar';

let globalCssProvider: Gtk.CssProvider | null = null;

export function reloadCss(cssInput: string) {
  const display = Gdk.Display.get_default();
  if (!display) {
    throw new Error('Cannot reload CSS without a default display');
  }

  const nextProvider = new Gtk.CssProvider();
  if (GLib.file_test(cssInput, GLib.FileTest.EXISTS)) {
    nextProvider.load_from_path(cssInput);
  } else {
    nextProvider.load_from_string(cssInput);
  }

  Gtk.StyleContext.add_provider_for_display(
    display,
    nextProvider,
    Gtk.STYLE_PROVIDER_PRIORITY_USER,
  );

  if (globalCssProvider) {
    Gtk.StyleContext.remove_provider_for_display(display, globalCssProvider);
  }

  globalCssProvider = null;

  try {
    system.gc();
  } catch (e) {
    console.error(e);
  }

  globalCssProvider = nextProvider;

  forceRedrawBar();
}

export function compileAndReloadCss(): Promise<void> {
  const configDir = `${GLib.get_user_config_dir()}/ags`;
  const scssPath = `${configDir}/style.scss`;
  const cssPath = `/tmp/ags-style.css`;

  return execAsync(`sass ${scssPath} ${cssPath}`)
    .then(() => {
      reloadCss(cssPath);
    })
    .catch((err) => {
      console.error(`Error compiling SCSS: ${err}`);
      throw err;
    });
}

export function initCss() {
  reloadCss(style);
  compileAndReloadCss().catch(() => {});
}
