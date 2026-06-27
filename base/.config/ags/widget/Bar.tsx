import app from "ags/gtk4/app"
import { Astal, Gdk, Gtk } from "ags/gtk4"
import Workspaces from "./bar/Workspaces"
import Tray from "./bar/Tray"
import Clock from "./bar/Clock"
import Volume from "./bar/Volume"
import SysMetrics from "./bar/SysMetrics"
import Wifi from "./bar/Wifi"
import Bluetooth from "./bar/Bluetooth"
import ScrollerIndicator from "./bar/ScrollerIndicator"
import Updates from "./bar/Updates"
import Weather from "./bar/Weather"

export default function Bar(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor

  return (
    <window
      visible
      name="bar"
      class="Bar"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      anchor={TOP}
      marginTop={2}
      marginBottom={2}
      application={app}
    >
      <box class="island" spacing={0} halign={Gtk.Align.CENTER}>
        <Workspaces gdkmonitor={gdkmonitor} />
        <box class="sep" />
        <ScrollerIndicator gdkmonitor={gdkmonitor} />
        <Weather gdkmonitor={gdkmonitor} />
        <Clock gdkmonitor={gdkmonitor} />
        <box class="sep" />
        <Updates gdkmonitor={gdkmonitor} />
        <SysMetrics gdkmonitor={gdkmonitor} />
        <box class="sep" />
        <Volume gdkmonitor={gdkmonitor} />
        <box class="Network" spacing={4}>
          <Bluetooth gdkmonitor={gdkmonitor} />
          <Wifi gdkmonitor={gdkmonitor} />
        </box>
        <Tray />
      </box>
    </window>
  )
}
