# Remote login with Moonlight

This configuration uses greetd / ReGreet and two independent Sunshine hosts:

| Host                  | When available                     | Output                          | HTTP / Web UI ports                            |
| --------------------- | ---------------------------------- | ------------------------------- | ---------------------------------------------- |
| `Ryprland Login`      | ReGreet is running                 | `RMT-LOGIN`, 1920×1080 at 60 Hz | `48089` / `48090`                              |
| Existing desktop host | User's Hyprland session is running | `RMT-1`, 1920×1080 at 60 Hz     | Existing settings (normally `47989` / `47990`) |

Both use `capture = wlr` to capture a headless Wayland output. When a physical display
is attached, the largest physical display is the ReGreet output and `RMT-LOGIN` mirrors
it for streaming. With no physical display, ReGreet runs directly on `RMT-LOGIN`.
No dummy plug is required by the configuration.
The login streamer uses VA-API, matching this machine's AMD GPU.

> [!IMPORTANT]
> Pair the login and desktop hosts separately. After login, reconnect to the desktop
> entry in Moonlight. Logging out restores the login host.

### How the login session is isolated

The greeter has separate keys, pairing state and Web UI credentials in
`/var/lib/ryprland-login` (mode `0700`, owner `greeter`). Never copy the desktop's credentials
there or commit generated credentials. Only a command-free `Login` application is exposed.
Sunshine runs without elevated capabilities. A dedicated group grants access to `uinput`,
while `render` grants GPU encoding access. Physical keyboard devices are not granted.

A private PipeWire / pipewire-pulse instance and WirePlumber's `policy` profile provide
a silent sink. The policy profile does not enumerate physical audio or camera devices.
These processes and Sunshine are terminated when ReGreet exits. Sunshine is restarted
after a failure while the greeter remains open; startup failures are logged and do not
prevent local login. No desktop keyring, audio session or home directory is shared.

## 1. Stage the installation

Install the dependencies (Sunshine uses the package source already configured on this host):

```bash
sudo pacman -S --needed greetd greetd-regreet materia-gtk-theme pipewire pipewire-pulse wireplumber libpulse jq dbus util-linux
pacman -Q sunshine
stow -n -v -t "$HOME" base
stow -t "$HOME" base
systemctl --user daemon-reload
sudo system/install.sh
```

> [!NOTE]
> The installer keeps an existing `/etc/greetd/config.toml` and stages the final configuration
> at `/etc/greetd/config.remote-login.toml`. The updated greeter is used at the next logout.
> It does not restart the session or change firewall rules, UPnP, or network exposure.

The dedicated `ryprland-sunshine.service` prepares `RMT-1` before each start and forces
`wlr` capture of that output. Hyprland imports its socket environment and starts the service
at login; shutdown requests service termination. `remote-desktop.sh --start` and `--stop`
remain available; `--prepare` is the internal service hook.

## 2. Pair and test while autologin remains enabled

> [!WARNING]
> Before logging out, save your work and ensure you have local access or a working SSH
> recovery connection. Stopping the desktop stream disconnects Moonlight. The installer
> does not install or configure SSH; recovery access must already work independently.

Log out normally. greetd's initial autologin occurs only once per boot; logout enters
the default ReGreet session. This exercises the new greeter without removing boot autologin.

### Open the login Web UI

The login Web UI accepts connections only from the PC running ReGreet. To open it
from another device, create an SSH tunnel. Run the following command in a terminal
on the device where you will use the browser, replacing `SSH_USER` and `HOST`:

```bash
ssh -N -L 127.0.0.1:48090:127.0.0.1:48090 SSH_USER@HOST
```

- `SSH_USER`: an account allowed to log in over SSH on the PC running ReGreet.
  Use your own account, not the `greeter` service account.
- `HOST`: that PC's reachable IP address or hostname.
- `-N`: keep the SSH connection open for forwarding without opening a remote shell.
- `-L 127.0.0.1:48090:127.0.0.1:48090`: forward port `48090` on your browser device's
  loopback interface to port `48090` on the remote PC's loopback interface.

> [!TIP]
> Keep the SSH terminal open; waiting without a shell prompt is normal.
> Open `https://127.0.0.1:48090` in a browser **on the same device where you ran SSH**.
> The Moonlight client can be on a different device. Press `Ctrl+C` when finished to close the tunnel.

Create unique Web UI credentials, and use the PIN page to enter the PIN shown by Moonlight.

Alternatively, use a browser on the PC running ReGreet from a
separate local session; do not add a browser or shell to the greeter's application list.

### Add the login host in Moonlight

On iPhone / iPad / Apple TV, keep the existing desktop entry, press **Add PC**, and manually
add `HOST:48089` while the machine is displaying ReGreet.

> [!IMPORTANT]
> The login host is offline while the desktop is running. Add it while ReGreet is visible,
> and keep the existing desktop entry for reconnecting after authentication.

Current Apple clients support Sunshine port families and store hosts by the UUID returned by each
Sunshine instance; the separate state files therefore keep the login and desktop entries
independent. Historical Apple clients before the alternate-port fix do not work here.

After a successful login, `Ryprland Login` becomes offline and the existing desktop entry becomes online;
select the desktop entry to reconnect. If adding the address reports that it cannot connect,
first confirm that the machine is still on ReGreet and that TCP port `48089` is listening.
If Moonlight reports that it updated an existing host instead of adding a second one, compare
the `uniqueid` values returned by the two Sunshine `/serverinfo` endpoints before disabling
autologin. Do not share certificates to work around client incompatibility.

The login stream uses TCP `48084`, `48089`, `48110` and UDP `48098`–`48100`;
`48090` is the management UI. Any existing firewall / VPN must allow streaming from the
intended client. Keep management access through localhost and do not add WAN forwarding.

### Verify before switching

- Both Moonlight entries can be paired and retained independently.
- With monitors unplugged, the login host shows ReGreet and accepts keyboard / pointer input.
- Incorrect credentials leave the login screen usable; disconnecting and reconnecting works.
- Correct credentials close the login stream. The desktop host becomes available with
  working video, input and normal desktop audio.
- Logout makes the login host available again, without orphaned Sunshine or audio processes.
- Local login appears on the largest attached monitor; the login stream mirrors it.
- Restarting the login Sunshine process recovers the stream without ending ReGreet.

## 3. Disable autologin after the tests pass

> [!WARNING]
> Complete the checks above before disabling autologin. Keep local or SSH recovery access
> available until the final cold-boot test succeeds.

```bash
sudo system/install.sh --enable-remote-login
```

This saves the previous config as `/etc/greetd/config.toml.backup.XXXXXX` and installs
the configuration with no `initial_session`. Record the backup path printed by the installer.
It does not restart greetd. Reboot at a suitable time, then test remote wake / boot with
physical monitors unplugged, authenticate through `Ryprland Login`, and reconnect to the
desktop.

## Recovery and diagnostics

> [!IMPORTANT]
> Choose a backup from **before autologin was disabled**. Confirm that it contains the original
> `[initial_session]` section with the correct user and session command. Each installer run
> backs up the configuration present at that time, so a later backup may already have autologin disabled.

From an existing SSH connection or a local TTY, restore that verified backup (replace
the placeholder below), then reboot when work has been saved:

```bash
sudo cp /etc/greetd/config.toml.backup.XXXXXX /etc/greetd/config.toml
```

> [!CAUTION]
> Restarting greetd terminates the current graphical session. Save your work first and
> avoid restarting it through your only remote connection.

Inspect logs and device permissions:

```bash
sudo journalctl -u greetd -b
sudo tail -n 100 /var/lib/ryprland-login/greeter.log
sudo tail -n 100 /var/lib/ryprland-login/sunshine.log
journalctl --user -u ryprland-sunshine.service -b
id greeter
ls -l /dev/uinput /dev/dri/renderD*
```

Never publish pairing state, keys, or Web UI credentials with diagnostic logs.

## Configuration checks

Repository checks (these do not operate the active seat):

```bash
bash -n system/install.sh system/usr/bin/ryprland-greeter system/usr/bin/ryprland-login-stream base/.local/bin/remote-desktop.sh
Hyprland --verify-config -c "$PWD/system/etc/greetd/hyprland.lua"
```

## References

- [Sunshine configuration](https://docs.lizardbyte.dev/projects/sunshine/latest/md_docs_2configuration.html): `wlr`, ports, file locations and Web UI access.
- [WirePlumber profiles](https://pipewire.pages.freedesktop.org/wireplumber/daemon/configuration/features_and_profiles.html): isolated policy management.
- [Apple client custom-port issue](https://github.com/moonlight-stream/moonlight-ios/issues/529): verify the installed client before activation.

[Back to installation](./installation.md)
