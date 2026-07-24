import { createBinding as bind } from 'ags';
import { Gtk } from 'ags/gtk4';

import Bluetooth from 'gi://AstalBluetooth';
import Network from 'gi://AstalNetwork';
import Pango from 'gi://Pango';

import { LucideIcon } from '../../../lib/lucide';
import { CaffeineState, caffeineState, toggleCaffeine } from '../../../services/caffeine';
import {
  openBluetoothMenu,
  openWifiMenu,
  toggleBluetooth,
  toggleWifi,
} from '../../../services/network';
import {
  cyclePowerProfile,
  getPowerIcon,
  getPowerLabel,
  getPowerProfile,
} from '../../../services/powerProfile';

export default function QuickToggles() {
  const network = Network.get_default();
  const wifi = network.wifi;
  const bt = Bluetooth.get_default();
  const power = getPowerProfile();

  return (
    <box orientation={Gtk.Orientation.VERTICAL} spacing={16}>
      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16} homogeneous>
        {/* Wi-Fi Toggle */}
        {wifi ? (
          <box
            class={bind(wifi, 'enabled').as((e) => `cc-toggle-btn ${e ? 'active' : ''}`)}
            spacing={0}
            css="padding: 0;"
          >
            <button
              hexpand
              class="cc-split-btn-left"
              css="padding: 16px;"
              onClicked={() => toggleWifi(wifi.enabled)}
              tooltipText="Toggle Wi-Fi"
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
                    label={bind(wifi, 'ssid').as((s) => s || 'Disconnected')}
                    css="font-size: 0.8em; opacity: 0.7;"
                    halign={Gtk.Align.START}
                    ellipsize={Pango.EllipsizeMode.END}
                    maxWidthChars={12}
                    lines={1}
                  />
                </box>
              </box>
            </button>
            <button
              class="cc-split-btn-right"
              css="padding: 16px;"
              onClicked={() => openWifiMenu()}
              tooltipText="Open Wi-Fi Menu"
            >
              <LucideIcon name="chevron-right" pixelSize={20} />
            </button>
          </box>
        ) : (
          <box visible={false} />
        )}

        {/* BT Toggle */}
        <box
          class={bind(bt, 'is_powered').as((e) => `cc-toggle-btn ${e ? 'active' : ''}`)}
          spacing={0}
          css="padding: 0;"
        >
          <button
            hexpand
            class="cc-split-btn-left"
            css="padding: 16px;"
            onClicked={() => toggleBluetooth(bt.is_powered)}
            tooltipText="Toggle Bluetooth"
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
                  label={bind(bt, 'is_connected').as((c) => (c ? 'Connected' : 'Disconnected'))}
                  css="font-size: 0.8em; opacity: 0.7;"
                  halign={Gtk.Align.START}
                />
              </box>
            </box>
          </button>
          <button
            class="cc-split-btn-right"
            css="padding: 16px;"
            onClicked={() => openBluetoothMenu()}
            tooltipText="Open Bluetooth Menu"
          >
            <LucideIcon name="chevron-right" pixelSize={20} />
          </button>
        </box>
      </box>

      <box orientation={Gtk.Orientation.HORIZONTAL} spacing={16} homogeneous>
        {/* Power Profile Toggle */}
        {power ? (
          <box
            class={bind(power, 'activeProfile').as(
              (p) => `cc-toggle-btn ${p === 'performance' ? 'active' : ''}`,
            )}
            spacing={0}
            css="padding: 0;"
          >
            <button
              hexpand
              class="cc-split-btn-left"
              css="padding: 16px; border-radius: 0.8em;"
              onClicked={cyclePowerProfile}
              tooltipText="Toggle Power Profile"
            >
              <box spacing={12}>
                <LucideIcon
                  name={bind(power, 'activeProfile').as(getPowerIcon)}
                  class="icon"
                  pixelSize={24}
                />
                <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
                  <label
                    label="Power Profile"
                    css="font-weight: 700; font-size: 1.1em;"
                    halign={Gtk.Align.START}
                  />
                  <label
                    label={bind(power, 'activeProfile').as(getPowerLabel)}
                    css="font-size: 0.8em; opacity: 0.7;"
                    halign={Gtk.Align.START}
                    ellipsize={Pango.EllipsizeMode.END}
                  />
                </box>
              </box>
            </button>
          </box>
        ) : (
          <box visible={false} />
        )}
        {/* Caffeine Toggle */}
        <box
          class={caffeineState.as(
            (s: CaffeineState) => `cc-toggle-btn ${s !== 'disabled' ? 'active' : ''}`,
          )}
          spacing={0}
          css="padding: 0;"
        >
          <button
            hexpand
            class="cc-split-btn-left"
            css="padding: 16px; border-radius: 0.8em;"
            onClicked={toggleCaffeine}
            tooltipText="Toggle Caffeine (Disabled -> Enabled -> Remote)"
          >
            <box spacing={12}>
              <LucideIcon
                name={caffeineState.as((s: CaffeineState) =>
                  s === 'enabled' ? 'coffee' : s === 'remote' ? 'server' : 'moon',
                )}
                class="icon"
                pixelSize={24}
              />
              <box orientation={Gtk.Orientation.VERTICAL} valign={Gtk.Align.CENTER}>
                <label
                  label="Caffeine"
                  css="font-weight: 700; font-size: 1.1em;"
                  halign={Gtk.Align.START}
                />
                <label
                  label={caffeineState.as((s: CaffeineState) =>
                    s === 'enabled' ? 'Active' : s === 'remote' ? 'Remote' : 'Inactive',
                  )}
                  css="font-size: 0.8em; opacity: 0.7;"
                  halign={Gtk.Align.START}
                />
              </box>
            </box>
          </button>
        </box>
      </box>
    </box>
  );
}
