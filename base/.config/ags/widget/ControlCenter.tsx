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
import { updatesPoll } from "./bar/Updates"

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
        hexpand
        drawValue={false}
        min={0}
        max={1}
        value={bind(speaker, "volume")}
        onChangeValue={(self: any, scroll: any, val: number) => {
          speaker.volume = val
          playSound()
        }}
      />

      <label
        label={bind(speaker, "volume").as((v) => `${Math.round(v * 100)}%`)}
        css="min-width: 40px; text-align: right; font-weight: 700;"
      />
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
        css="min-height: 100px;"
      >
        <label
          label="No Media Playing"
          css="color: rgba(currentColor, 0.5); font-weight: 700;"
        />
      </box>

      <For each={bind(mpris, "players").as((p) => p.slice(0, 1))}>
        {(player) => (
          <box class="cc-card" spacing={16}>
            <box
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

              {cava && (
                <box heightRequest={24} valign={Gtk.Align.END}>
                  <label
                    useMarkup={true}
                    label={bind(cava, "values").as((v) => {
                      const CAVA_CHARS = [
                        "\u2581",
                        "\u2582",
                        "\u2583",
                        "\u2584",
                        "\u2585",
                        "\u2586",
                        "\u2587",
                        "\u2588",
                      ]
                      const GRADIENT = [
                        "#8be9fd",
                        "#96e2fc",
                        "#a1dbfb",
                        "#acd4fb",
                        "#b7cdfa",
                        "#c2c6f9",
                        "#cdbff8",
                        "#d8b8f8",
                        "#e3b1f7",
                        "#eeabf6",
                        "#f9a4f6",
                        "#ff9df5",
                        "#ff95ed",
                        "#ff8de5",
                        "#ff85dd",
                        "#ff79c6",
                      ]
                      // Force the array to only process the first 16 values to prevent doubling and stretching
                      return v
                        .slice(0, 16)
                        .map((val: number, idx: number) => {
                          let i = Math.floor(val * CAVA_CHARS.length)
                          if (i < 0) i = 0
                          if (i >= CAVA_CHARS.length) i = CAVA_CHARS.length - 1
                          return `<span fgcolor="${GRADIENT[idx]}">${CAVA_CHARS[i]}</span>`
                        })
                        .join("")
                    })}
                    css="font-size: 14px; margin-bottom: 8px; font-weight: 800;"
                    halign={Gtk.Align.START}
                    valign={Gtk.Align.END}
                  />
                </box>
              )}

              <box spacing={16} halign={Gtk.Align.START}>
                <button class="icon-btn" onClicked={() => player.previous()}>
                  <LucideIcon name="skip-back" pixelSize={20} />
                </button>
                <button class="icon-btn" onClicked={() => player.play_pause()}>
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
        )}
      </For>
    </box>
  )
}

function CircularProgress({
  variable,
  transformer,
  label,
  sublabel,
  color,
}: {
  variable: any
  transformer: (v: any) => number
  label: string
  sublabel: import("ags").Binding<string> | string
  color: string
}) {
  const hex2rgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16) / 255
    const g = parseInt(hex.slice(3, 5), 16) / 255
    const b = parseInt(hex.slice(5, 7), 16) / 255
    return [r, g, b]
  }
  const [r, g, b] = hex2rgb(color)

  const area = new Gtk.DrawingArea()
  area.set_content_width(120)
  area.set_content_height(120)
  area.set_size_request(120, 120)

  let currentValue = transformer(variable.get())
  variable.subscribe(() => {
    currentValue = transformer(variable.get())
    area.queue_draw()
  })

  area.set_draw_func((_area, cr, width, height) => {
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
      <label
        label={label}
        css={`
          color: ${color};
          font-weight: 800;
          font-size: 14px;
        `}
      />
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
          label="CPU"
          sublabel={cpu.as((c) => `${Math.round(c)}%`)}
          color="#ff79c6"
        />
      </box>

      <box halign={Gtk.Align.CENTER}>
        <CircularProgress
          variable={ram}
          transformer={(r: any) => r.percent}
          label="RAM"
          sublabel={ram.as(
            (r) => `${r.used.toFixed(1)} / ${r.total.toFixed(0)}GB`,
          )}
          color="#8be9fd"
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
      <LucideIcon
        name="package"
        pixelSize={24}
        class="icon"
        css="color: #ffb86c;"
      />
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
          execAsync("kitty paru -Syu")
        }}
      >
        <LucideIcon name="download" pixelSize={20} />
      </button>
    </box>
  )
}

export default function ControlCenter(gdkmonitor: Gdk.Monitor) {
  const { TOP, RIGHT } = Astal.WindowAnchor

  return (
    <window
      name={`control-center-${gdkmonitor.get_connector()}`}
      class="ControlCenter"
      gdkmonitor={gdkmonitor}
      exclusivity={Astal.Exclusivity.NORMAL}
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
