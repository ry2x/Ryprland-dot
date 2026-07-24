import { Astal, Gdk } from 'ags/gtk4';
import app from 'ags/gtk4/app';

const BORDER_WIDTH = 3;
const BAR_WIDTH = 47;

export default function BarReserve(gdkmonitor: Gdk.Monitor) {
  const { TOP, BOTTOM, LEFT } = Astal.WindowAnchor;

  return (
    <window
      visible
      name={`bar-reserve-${gdkmonitor.get_connector()}`}
      cssClasses={['BarReserve']}
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.EXCLUSIVE}
      layer={Astal.Layer.BOTTOM}
      anchor={TOP | BOTTOM | LEFT}
      application={app}
    >
      <box widthRequest={BAR_WIDTH + BORDER_WIDTH} />
    </window>
  );
}
