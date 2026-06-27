import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"

export default function DateWeatherPopup(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor

  return (
    <window
      name={`date-weather-popup-${gdkmonitor.get_connector()}`}
      class="DateWeatherPopup"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP}
      marginTop={8}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <box class="dw-container" spacing={24}>
        {/* LEFT COLUMN: Weather & Calendar */}
        <box orientation={Gtk.Orientation.VERTICAL} spacing={16} class="left-column">
          <box class="weather-card widget-card">
             <label label="Weather Forecast will go here..." css="color: alpha(currentColor, 0.5);" />
          </box>

          <box class="calendar-card widget-card" halign={Gtk.Align.CENTER}>
             {/* GTK Calendar component */}
             <calendar />
          </box>
        </box>

        {/* Separator between columns */}
        <box class="vertical-sep" />

        {/* RIGHT COLUMN: Notifications */}
        <box orientation={Gtk.Orientation.VERTICAL} spacing={16} class="right-column">
          <box class="notif-header">
            <label label="Notifications" class="dw-title" halign={Gtk.Align.START} hexpand />
            <button class="clear-all-btn" onClicked={() => console.log("TODO: Clear all")}>
              <box spacing={6}>
                <label label="Clear All" css="font-size: 0.8em; font-weight: 600;" />
              </box>
            </button>
          </box>

          <scrollable class="notif-scroll" vscroll={Gtk.PolicyType.AUTOMATIC} hscroll={Gtk.PolicyType.NEVER} vexpand>
            <box orientation={Gtk.Orientation.VERTICAL} spacing={12} class="notif-list">
              <label label="Notifications will appear here..." css="color: alpha(currentColor, 0.5);" />
            </box>
          </scrollable>
        </box>
      </box>
    </window>
  )
}
