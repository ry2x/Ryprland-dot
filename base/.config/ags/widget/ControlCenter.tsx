import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"

export default function ControlCenter(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor

  return (
    <window
      name={`control-center-${gdkmonitor.get_connector()}`}
      class="ControlCenter"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      anchor={TOP | RIGHT}
      marginTop={8}
      marginRight={16}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <box class="cc-container" orientation={Gtk.Orientation.VERTICAL} spacing={16}>
        <label label="Control Center" class="cc-title" halign={Gtk.Align.START} />
        {/* We will build the beautifully designed cards (Network, Volume, Metrics) here */}
        <label label="Cards will go here..." css="color: alpha(currentColor, 0.5);" />
      </box>
    </window>
  )
}
