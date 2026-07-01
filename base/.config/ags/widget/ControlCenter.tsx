import { Astal, Gtk, Gdk } from "ags/gtk4"
import app from "ags/gtk4/app"
import Network from "gi://AstalNetwork"
import Wp from "gi://AstalWp"
import Mpris from "gi://AstalMpris"
import Bluetooth from "gi://AstalBluetooth"
import AstalCava from "gi://AstalCava"
import { createBinding as bind, For } from "ags"
import { createPoll } from "ags/time"
import { execAsync } from "ags/process"
import { LucideIcon } from "../lib/lucide"
import Pango from "gi://Pango"
import { updatesPoll, refreshUpdates } from "./bar/Updates"

const cpu = createPoll(0, 2000, () =>
  execAsync(["bash", "-c", "top -bn1 | grep 'Cpu(s)' | awk '{print $2 + $4}'"])
    .then((out) => {
      const val = parseFloat(out)
      return isNaN(val) ? 0 : val
    })
    .catch(() => 0),
)

const ram = createPoll({ used: 0, total: 0, percent: 0 }, 2000, () =>
  execAsync(["bash", "-c", "free -m | grep Mem | awk '{print $3, $2}'"])
    .then((out) => {
      const [usedMiB, totalMiB] = out.split(" ").map(Number)
      if (isNaN(usedMiB) || isNaN(totalMiB) || totalMiB === 0) {
        return { used: 0, total: 0, percent: 0 }
      }
      return {
        used: usedMiB / 1024,
        total: totalMiB / 1024,
        percent: usedMiB / totalMiB,
      }
    })
    .catch(() => ({ used: 0, total: 0, percent: 0 })),
)

const gpu = createPoll(0, 2000, () =>
  execAsync([
    "bash",
    "-c",
    "cat /sys/class/drm/card*/device/gpu_busy_percent 2>/dev/null | sort -nr | head -n 1",
  ])
    .then((out) => {
      const val = parseFloat(out)
      return isNaN(val) ? 0 : val
    })
    .catch(() => 0),
)

function QuickToggles() {
  const network = Network.get_default()
  const wifi = network.wifi
  const bt = Bluetooth.get_default()

  return (
    <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16} homogeneous>
      {/* Wi-Fi Toggle */}
      <button
        class={bind(wifi, "enabled").as(
          (e) => `cc-toggle-btn ${e ? "active" : ""}`,
        )}
        onClicked={() =>
          execAsync([
            "bash",
            "-c",
            `nmcli radio wifi ${wifi.enabled ? "off" : "on"}`,
          ]).catch(console.error)
        }
      >
        <box spacing={12}>
          <LucideIcon name="wifi" class="icon" pixelSize={24} />
          <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
            <label
              label="Wi-Fi"
              css="font-weight: 700; font-size: 1.1em;"
              halign={Gtk.Align.START}
            />
            <label
              label={bind(wifi, "ssid").as((s) => s || "Disconnected")}
              css="font-size: 0.8em; opacity: 0.7;"
              halign={Gtk.Align.START}
              ellipsize={Pango.EllipsizeMode.END}
              maxWidthChars={12}
              lines={1}
            />
          </box>
        </box>
      </button>

      {/* BT Toggle */}
      <button
        class={bind(bt, "is_powered").as(
          (e) => `cc-toggle-btn ${e ? "active" : ""}`,
        )}
        onClicked={() =>
          execAsync([
            "bash",
            "-c",
            `rfkill ${bt.is_powered ? "block" : "unblock"} bluetooth`,
          ]).catch(console.error)
        }
      >
        <box spacing={12}>
          <LucideIcon name="bluetooth" class="icon" pixelSize={24} />
          <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
            <label
              label="Bluetooth"
              css="font-weight: 700; font-size: 1.1em;"
              halign={Gtk.Align.START}
            />
            <label
              label={bind(bt, "is_connected").as((c) =>
                c ? "Connected" : "Disconnected",
              )}
              css="font-size: 0.8em; opacity: 0.7;"
              halign={Gtk.Align.START}
            />
          </box>
        </box>
      </button>
    </box>
  )
}

function VolumeSlider() {
  const speaker = Wp.get_default()?.audio.default_speaker
  if (!speaker) return <box />

  const volIcon = bind(speaker, "volume_icon").as((icon) => {
    if (icon.includes("muted")) return "volume-x"
    if (icon.includes("high")) return "volume-2"
    if (icon.includes("medium")) return "volume-1"
    if (icon.includes("low")) return "volume"
    return "volume-x"
  })

  let lastPlay = 0
  const playSound = () => {
    const now = Date.now()
    if (now - lastPlay > 100) {
      lastPlay = now
      execAsync([
        "pw-play",
        "/usr/share/sounds/freedesktop/stereo/audio-volume-change.oga",
      ]).catch(() => {})
    }
  }

  return (
    <box class="cc-card" spacing={16}>
      <button class="icon-btn" onClicked={() => (speaker.mute = !speaker.mute)}>
        <LucideIcon name={volIcon} pixelSize={20} />
      </button>

      <slider
        class="volume-slider"
        hexpand
        drawValue={false}
        min={0}
        max={1}
        value={bind(speaker, "volume")}
        onChangeValue={(_self, _scroll, val: number) => {
          speaker.volume = val
          playSound()
        }}
      />

      <label
        label={bind(speaker, "volume").as((v) => `${Math.round(v * 100)}%`)}
        css="min-width: 40px; font-weight: 700;"
        halign={Gtk.Align.END}
      />
    </box>
  )
}

function CavaWidget() {
  const cava = AstalCava.get_default()
  if (!cava) return <box visible={false} />

  const area = new Gtk.DrawingArea()
  area.set_size_request(-1, 160) // 160px fixed height
  area.set_hexpand(true)

  cava.connect("notify::values", () => {
    area.queue_draw()
  })

  area.set_draw_func((_area, cr, width, height) => {
    const vals = cava.values.slice(0, 30) // Reduce bars to 30 to add spacing
    if (vals.length === 0) return

    const SENSITIVITY = 1.5
    const barWidth = width / vals.length
    const padding = 2

    const ctx = _area.get_style_context()
    const color = ctx.get_color()
    cr.setSourceRGBA(color.red, color.green, color.blue, 0.15) // Overlap color

    for (let i = 0; i < vals.length; i++) {
      const val = Math.min(vals[i] * SENSITIVITY, 1.0)
      const barHeight = Math.max(val * height, 2)
      cr.rectangle(
        i * barWidth + padding / 2,
        height - barHeight,
        barWidth - padding,
        barHeight,
      )
      cr.fill()
    }
  })

  return (
    <box
      class="cava-visualizer"
      css="margin-bottom: -160px; margin-left: 20px; margin-right: 20px;"
      canTarget={false}
      valign={Gtk.Align.END}
    >
      {area}
    </box>
  )
}

function MediaCard() {
  const mpris = Mpris.get_default()
  const cava = AstalCava.get_default()
  if (cava) {
    cava.bars = 16
    cava.stereo = false
  }

  return (
    <box
      class="cc-media-container"
      orientation={Gtk.Orientation.VERTICAL}
      spacing={8}
    >
      <box
        visible={bind(mpris, "players").as((p) => p.length === 0)}
        halign={Gtk.Align.CENTER}
        valign={Gtk.Align.CENTER}
        css="min-height: 160px;"
      >
        <label
          label="No Media Playing"
          css="color: alpha(currentColor, 0.5); font-weight: 700;"
        />
      </box>

      <For each={bind(mpris, "players").as((p) => p.slice(0, 1))}>
        {(player) => (
          <box
            class="cc-card"
            orientation={Gtk.Orientation.VERTICAL}
            css="padding: 0;"
            heightRequest={160}
          >
            {/* CAVA (Drawn First -> Background) */}
            <CavaWidget />

            <box spacing={16} css="padding: 16px;" vexpand={true}>
              <box
                valign={Gtk.Align.CENTER}
                css={bind(player, "cover_art").as(
                  (art) => `
                background-image: url('${art && (art.startsWith("/") || art.startsWith("file://")) ? (art.startsWith("file://") ? art : `file://${art}`) : ""}');
                background-size: cover;
                background-position: center;
                border-radius: 12px;
                min-width: 80px;
                min-height: 80px;
              `,
                )}
              />
              <box
                orientation={Gtk.Orientation.VERTICAL}
                valign={Gtk.Align.CENTER}
                hexpand
              >
                <label
                  label={bind(player, "title").as((t) => t || "Unknown")}
                  css="font-weight: 800; font-size: 1.2em;"
                  halign={Gtk.Align.START}
                  wrap={true}
                  wrapMode={Pango.WrapMode.WORD_CHAR}
                  maxWidthChars={20}
                  lines={2}
                  ellipsize={Pango.EllipsizeMode.END}
                />
                <label
                  label={bind(player, "artist").as((a) => a || "Unknown")}
                  css="opacity: 0.7; font-size: 0.9em; margin-bottom: 4px;"
                  halign={Gtk.Align.START}
                  wrap={true}
                  wrapMode={Pango.WrapMode.WORD_CHAR}
                  maxWidthChars={25}
                  lines={1}
                  ellipsize={Pango.EllipsizeMode.END}
                />

                <box spacing={16} halign={Gtk.Align.START}>
                  <button class="icon-btn" onClicked={() => player.previous()}>
                    <LucideIcon name="skip-back" pixelSize={20} />
                  </button>
                  <button
                    class="icon-btn"
                    onClicked={() => player.play_pause()}
                  >
                    <LucideIcon
                      name={bind(player, "playback_status").as((s) =>
                        s === Mpris.PlaybackStatus.PLAYING ? "pause" : "play",
                      )}
                      pixelSize={20}
                    />
                  </button>
                  <button class="icon-btn" onClicked={() => player.next()}>
                    <LucideIcon name="skip-forward" pixelSize={20} />
                  </button>
                </box>
              </box>
            </box>
          </box>
        )}
      </For>
    </box>
  )
}

function CircularProgress<T>({
  variable,
  transformer,
  icon,
  label,
  sublabel,
  cssClass,
}: {
  variable: { get: () => T; subscribe: (fn: () => void) => void }
  transformer: (v: T) => number
  icon: string
  label: string
  sublabel: import("ags").Binding<string> | string
  cssClass: string
}) {
  const area = new Gtk.DrawingArea()
  area.add_css_class(cssClass)
  area.set_content_width(120)
  area.set_content_height(120)
  area.set_size_request(120, 120)

  let currentValue = transformer(variable.get())
  variable.subscribe(() => {
    currentValue = transformer(variable.get())
    area.queue_draw()
  })

  area.set_draw_func((_area, cr, width, height) => {
    const ctx = _area.get_style_context()
    const color = ctx.get_color() // Automatically fetches the color from CSS
    const r = color.red
    const g = color.green
    const b = color.blue

    const center_x = width / 2
    const center_y = height / 2
    const radius = Math.min(width, height) / 2 - 6

    const safeValue = isNaN(currentValue)
      ? 0
      : Math.max(0, Math.min(1, currentValue))

    cr.setSourceRGBA(r, g, b, 0.15)
    cr.setLineWidth(6)
    cr.arc(center_x, center_y, radius, 0, 2 * Math.PI)
    cr.stroke()

    if (safeValue > 0) {
      cr.setSourceRGBA(r, g, b, 1.0)
      cr.setLineWidth(6)
      cr.setLineCap(1) // ROUND
      cr.arc(
        center_x,
        center_y,
        radius,
        1.5 * Math.PI,
        1.5 * Math.PI + safeValue * 2 * Math.PI,
      )
      cr.stroke()
    }
  })

  const overlay = new Gtk.Overlay()
  overlay.set_child(area)

  const textContainer = (
    <box
      orientation={Gtk.Orientation.VERTICAL}
      valign={Gtk.Align.CENTER}
      halign={Gtk.Align.CENTER}
    >
      <box spacing={6} valign={Gtk.Align.CENTER} class={cssClass}>
        <LucideIcon name={icon} pixelSize={14} />
        <label
          label={label}
          css={`
            font-weight: 800;
            font-size: 14px;
          `}
        />
      </box>
      <label
        label={sublabel}
        css="opacity: 0.7; font-weight: 700; font-size: 11px; margin-top: 2px;"
      />
    </box>
  )

  overlay.add_overlay(textContainer)

  return overlay
}

function SystemMetrics() {
  return (
    <box
      class="cc-card"
      orientation={Gtk.Orientation.HORIZONTAL}
      spacing={16}
      homogeneous
      hexpand
    >
      <box halign={Gtk.Align.CENTER}>
        <CircularProgress
          variable={cpu}
          transformer={(c: number) => c / 100}
          icon="cpu"
          label="CPU"
          sublabel={cpu.as((c) => `${Math.round(c)}%`)}
          cssClass="cpu-progress"
        />
      </box>

      <box halign={Gtk.Align.CENTER}>
        <CircularProgress
          variable={ram}
          transformer={(r: { percent: number; used: number; total: number }) =>
            r.percent
          }
          icon="memory-stick"
          label="RAM"
          sublabel={ram.as(
            (r) => `${r.used.toFixed(1)} / ${r.total.toFixed(0)}GB`,
          )}
          cssClass="ram-progress"
        />
      </box>

      <box halign={Gtk.Align.CENTER}>
        <CircularProgress
          variable={gpu}
          transformer={(g: number) => g / 100}
          icon="gpu"
          label="GPU"
          sublabel={gpu.as((g) => `${Math.round(g)}%`)}
          cssClass="gpu-progress"
        />
      </box>
    </box>
  )
}

function UpdatesCard() {
  const isAvailable = updatesPoll.as((u) => parseInt(u) > 0)
  const labelText = updatesPoll.as((u) => {
    const count = parseInt(u)
    return count > 0 ? `${count} Updates Available` : "System is Up to Date"
  })

  return (
    <box
      class="cc-card"
      orientation={Gtk.Orientation.HORIZONTAL}
      spacing={16}
      hexpand
    >
      <LucideIcon name="package" pixelSize={24} class="icon updates-icon" />
      <box
        orientation={Gtk.Orientation.VERTICAL}
        valign={Gtk.Align.CENTER}
        hexpand
      >
        <label
          label="System Updates"
          css="font-weight: 800; font-size: 1.1em;"
          halign={Gtk.Align.START}
        />
        <label
          label={labelText}
          css="opacity: 0.7; font-size: 0.9em;"
          halign={Gtk.Align.START}
        />
      </box>
      <button
        class="icon-btn"
        valign={Gtk.Align.CENTER}
        visible={isAvailable}
        onClicked={() => {
          app.get_monitors().forEach((m) => {
            const conn = m.get_connector()
            const cc = app.get_window(`control-center-${conn}`)
            const dw = app.get_window(`date-weather-popup-${conn}`)
            if (cc) cc.set_visible(false)
            if (dw) dw.set_visible(false)
          })
          execAsync("kitty --title PacUpdate par_tui")
            .then(() => refreshUpdates())
            .catch(console.error)
        }}
      >
        <LucideIcon name="download" pixelSize={20} />
      </button>
    </box>
  )
}

export default function ControlCenter(gdkmonitor: Gdk.Monitor) {
  const { TOP } = Astal.WindowAnchor

  return (
    <window
      name={`control-center-${gdkmonitor.get_connector()}`}
      class="ControlCenter"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
      layer={Astal.Layer.TOP}
      anchor={TOP}
      marginTop={8}
      keymode={Astal.Keymode.ON_DEMAND}
      application={app}
      visible={false}
    >
      <box
        class="cc-container"
        orientation={Gtk.Orientation.VERTICAL}
        spacing={16}
        widthRequest={420}
      >
        <label
          label="Control Center"
          class="cc-title"
          halign={Gtk.Align.START}
        />

        <QuickToggles />
        <VolumeSlider />
        <MediaCard />

        <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16}>
          <SystemMetrics />
        </box>

        <UpdatesCard />
      </box>
    </window>
  )
}
