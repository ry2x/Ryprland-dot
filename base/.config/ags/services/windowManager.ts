import app from "ags/gtk4/app"
import Hyprland from "gi://AstalHyprland"
import { execAsync } from "ags/process"

export function focusWindow(className: string) {
  execAsync(`hyprctl dispatch focuswindow "class:^(${className})$"`).catch(() => {})
}

export function closeAllControlCenters() {
  app.get_monitors().forEach((m) => {
    const cc = app.get_window(`control-center-${m.get_connector()}`)
    if (cc) cc.set_visible(false)
  })
}

export function closeAllDateWeathers() {
  app.get_monitors().forEach((m) => {
    const dw = app.get_window(`date-weather-popup-${m.get_connector()}`)
    if (dw) dw.set_visible(false)
  })
}

export function closeAllAppLaunchers() {
  app.get_monitors().forEach((m) => {
    const al = app.get_window(`applauncher-${m.get_connector()}`)
    if (al) al.set_visible(false)
  })
}

export function closeAllMenus() {
  closeAllControlCenters()
  closeAllDateWeathers()
  closeAllAppLaunchers()
}

export function toggleControlCenter(monitorName?: string | null) {
  const targetMonitor = monitorName || Hyprland.get_default().get_focused_monitor().name
  app.get_monitors().forEach((m) => {
    const cc = app.get_window(`control-center-${m.get_connector()}`)
    const dw = app.get_window(`date-weather-popup-${m.get_connector()}`)
    if (cc) {
      if (m.get_connector() === targetMonitor) {
        if (cc.get_visible()) {
          cc.set_visible(false)
        } else {
          if (dw) dw.set_visible(false)
          cc.set_visible(true)
        }
      } else {
        cc.set_visible(false)
      }
    }
  })
}

export function toggleDateWeather(monitorName?: string | null) {
  const targetMonitor = monitorName || Hyprland.get_default().get_focused_monitor().name
  app.get_monitors().forEach((m) => {
    const dw = app.get_window(`date-weather-popup-${m.get_connector()}`)
    const cc = app.get_window(`control-center-${m.get_connector()}`)
    if (dw) {
      if (m.get_connector() === targetMonitor) {
        if (dw.get_visible()) {
          dw.set_visible(false)
        } else {
          if (cc) cc.set_visible(false)
          dw.set_visible(true)
        }
      } else {
        dw.set_visible(false)
      }
    }
  })
}

export function toggleAppLauncher(monitorName?: string | null) {
  const targetMonitor = monitorName || Hyprland.get_default().get_focused_monitor().name
  app.get_monitors().forEach((m) => {
    const al = app.get_window(`applauncher-${m.get_connector()}`)
    if (al) {
      if (m.get_connector() === targetMonitor) {
        al.set_visible(!al.get_visible())
      } else {
        al.set_visible(false)
      }
    }
  })
}
