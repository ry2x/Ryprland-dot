import { createState } from 'ags';
import { Astal } from 'ags/gtk4';
import app from 'ags/gtk4/app';
import { execAsync } from 'ags/process';

import Hyprland from 'gi://AstalHyprland';

export const activeSidePanel = {
  value: { panel: '', monitor: '' },
  callbacks: [] as ((val: { panel: string; monitor: string }) => void)[],
  get() {
    return this.value;
  },
  set(panel: string, monitor: string) {
    this.value = { panel, monitor };
    this.callbacks.forEach((cb) => cb(this.value));
  },
  subscribe(cb: (val: { panel: string; monitor: string }) => void) {
    this.callbacks.push(cb);
    cb(this.value);
  },
};

export const [animDx, setAnimDx] = createState<number>(47);

type AnimatedWindow = Astal.Window & {
  hide_animated?: () => void;
  show_animated?: () => void;
};

export function focusWindow(className: string) {
  Hyprland.get_default().dispatch('focuswindow', `class:^(${className})$`);
}

export function closeAllControlCenters() {
  app.get_monitors().forEach((m) => {
    const cc = app.get_window(`control-center-${m.get_connector()}`) as AnimatedWindow;
    if (cc && cc.get_visible()) {
      if (cc.hide_animated) cc.hide_animated();
      else cc.set_visible(false);
    }
  });
  if (activeSidePanel.get().panel === 'control-center') activeSidePanel.set('', '');
}

export function closeAllDateWeathers() {
  app.get_monitors().forEach((m) => {
    const dw = app.get_window(`date-weather-popup-${m.get_connector()}`) as AnimatedWindow;
    if (dw && dw.get_visible()) {
      if (dw.hide_animated) dw.hide_animated();
      else dw.set_visible(false);
    }
  });
  if (activeSidePanel.get().panel === 'date-weather') activeSidePanel.set('', '');
}

export function closeAllAppLaunchers() {
  app.get_monitors().forEach((m) => {
    const al = app.get_window(`applauncher-${m.get_connector()}`);
    if (al) al.set_visible(false);
  });
}

export function closeAllMenus() {
  closeAllControlCenters();
  closeAllDateWeathers();
  closeAllAppLaunchers();
}

export function toggleControlCenter(monitorName?: string | null) {
  const targetMonitor = monitorName || Hyprland.get_default().get_focused_monitor().name;
  app.get_monitors().forEach((m) => {
    const connector = m.get_connector();
    const cc = app.get_window(`control-center-${connector}`) as AnimatedWindow;
    const dw = app.get_window(`date-weather-popup-${connector}`) as AnimatedWindow;
    if (cc) {
      if (connector === targetMonitor) {
        const isActive =
          activeSidePanel.get().panel === 'control-center' &&
          activeSidePanel.get().monitor === connector;
        if (isActive) {
          cc.hide_animated?.();
        } else {
          if (dw && dw.get_visible()) dw.hide_animated?.();
          cc.show_animated?.();
          activeSidePanel.set('control-center', connector ?? '');
        }
      } else {
        if (cc.get_visible()) cc.hide_animated?.();
      }
    }
  });
}

export function toggleDateWeather(monitorName?: string | null) {
  const targetMonitor = monitorName || Hyprland.get_default().get_focused_monitor().name;
  app.get_monitors().forEach((m) => {
    const connector = m.get_connector();
    const dw = app.get_window(`date-weather-popup-${connector}`) as AnimatedWindow;
    const cc = app.get_window(`control-center-${connector}`) as AnimatedWindow;
    if (dw) {
      if (connector === targetMonitor) {
        const isActive =
          activeSidePanel.get().panel === 'date-weather' &&
          activeSidePanel.get().monitor === connector;
        if (isActive) {
          dw.hide_animated?.();
        } else {
          if (cc && cc.get_visible()) cc.hide_animated?.();
          dw.show_animated?.();
          activeSidePanel.set('date-weather', connector ?? '');
        }
      } else {
        if (dw.get_visible()) dw.hide_animated?.();
      }
    }
  });
}

export function toggleAppLauncher(monitorName?: string | null) {
  const targetMonitor = monitorName || Hyprland.get_default().get_focused_monitor().name;
  app.get_monitors().forEach((m) => {
    const al = app.get_window(`applauncher-${m.get_connector()}`);
    if (al) {
      if (m.get_connector() === targetMonitor) {
        al.set_visible(!al.get_visible());
      } else {
        al.set_visible(false);
      }
    }
  });
}

export function toggleScrollerOverview() {
  execAsync('hyprctl dispatch "hl.plugin.scrolloverview.overview(\'toggle\')"').catch(() => {});
}
