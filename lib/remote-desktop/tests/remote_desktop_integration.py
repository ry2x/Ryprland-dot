"""Optional real Hyprland/Sunshine integration test in an isolated nested session.

Requires a running Hyprland desktop, Sunshine and openssl. No user pairing files
are changed; the test Sunshine host listens only on loopback ports 51084/51110.
"""

import json
import os
from pathlib import Path
import subprocess
import tempfile
import time

script = str(Path(__file__).resolve().parents[3] / 'base/.local/bin/remote-desktop.sh')
parent = os.environ.copy()
root = Path(tempfile.mkdtemp(prefix='ryprland-remote-integration-'))
runtime = root / 'runtime'
runtime.mkdir(mode=0o700)
config = root / 'hyprland.lua'
signature_file = root / 'signature'
config.write_text('hl.config({misc={mouse_move_enables_dpms=true,disable_hyprland_logo=true}})\nhl.monitor({output="WAYLAND-1",mode="1920x1080@60",position="0x0",scale=1})\n'
    + 'hl.on("hyprland.start", function() local f=assert(io.open(' + json.dumps(str(signature_file))
    + ', "w")); f:write(os.getenv("HYPRLAND_INSTANCE_SIGNATURE")); f:close() end)\n')
env = parent.copy()
env.update(XDG_RUNTIME_DIR=str(runtime), AQ_DRM_DEVICES='/dev/null',
           WAYLAND_DISPLAY=str(Path(parent['XDG_RUNTIME_DIR']) / parent['WAYLAND_DISPLAY']))
env.pop('DISPLAY', None)
print('Test directory:', root, flush=True)
with (root / 'hyprland.log').open('w') as log:
    compositor = subprocess.Popen(['Hyprland', '--config', str(config)], env=env, stdout=log, stderr=log)

def run(*args):
    p = subprocess.run(args, env=env, text=True, capture_output=True, timeout=15)
    if p.returncode:
        raise RuntimeError(f'{args}: {p.stdout} {p.stderr}')
    return p.stdout

def monitors():
    return json.loads(run('hyprctl', '-j', 'monitors'))

try:
    for _ in range(100):
        if signature_file.exists():
            env['HYPRLAND_INSTANCE_SIGNATURE'] = signature_file.read_text()
            env['WAYLAND_DISPLAY'] = 'wayland-1'
            break
        if compositor.poll() is not None:
            raise RuntimeError('Nested compositor exited: ' + (root / 'hyprland.log').read_text()[-5000:])
        time.sleep(.1)
    else:
        raise RuntimeError('Nested compositor startup timed out')
    clients = json.loads(subprocess.check_output(['hyprctl', '-j', 'clients'], env=parent, text=True))
    for client in clients:
        if client['pid'] == compositor.pid:
            code = 'hl.dispatch(hl.dsp.window.move({window=' + json.dumps('address:' + client['address']) + ',workspace="special:remote-test",follow=false}))'
            subprocess.run(['hyprctl', 'eval', code], env=parent, check=True, capture_output=True)
    time.sleep(.1)
    before = monitors()
    print('Nested outputs:', [m['name'] for m in before], flush=True)
    run('hyprctl', 'eval', 'hl.dispatch(hl.dsp.cursor.move({x=200,y=200}))')
    cursor_preparation = json.loads(run('hyprctl', '-j', 'cursorpos'))
    run(script, '--prepare')
    print('Preparation cursor:', cursor_preparation, json.loads(run('hyprctl', '-j', 'cursorpos')), flush=True)
    assert json.loads(run('hyprctl', '-j', 'cursorpos')) == cursor_preparation
    ready = monitors()
    remote = next(m for m in ready if m['name'] == 'RMT-1')
    assert (remote['x'], remote['y'], remote['width'], remote['height']) == (10000, 10000, 1920, 1080), remote
    # Probe the same layout clamping used by relative pointer motion, from both edges.
    run('hyprctl', 'eval', 'hl.dispatch(hl.dsp.cursor.move({x=1919,y=500})); hl.dispatch(hl.dsp.cursor.move({x=2019,y=500}))')
    assert json.loads(run('hyprctl', '-j', 'cursorpos'))['x'] < 2000
    run('hyprctl', 'eval', 'hl.dispatch(hl.dsp.cursor.move({x=10000,y=10540})); hl.dispatch(hl.dsp.cursor.move({x=9900,y=10540}))')
    assert json.loads(run('hyprctl', '-j', 'cursorpos'))['x'] >= 10000
    run('hyprctl', 'eval', 'hl.dispatch(hl.dsp.focus({monitor="WAYLAND-1"})); hl.dispatch(hl.dsp.cursor.move({x=200,y=200}))')
    print('Pointer clamping at both separated display edges: PASS', flush=True)
    focus_before = next(m['name'] for m in ready if m['focused'])
    cursor_before = json.loads(run('hyprctl', '-j', 'cursorpos'))
    options_before = {k: json.loads(run('hyprctl', '-j', 'getoption', k)) for k in ['misc:mouse_move_enables_dpms', 'cursor:no_warps']}
    run(script, '--enter')
    run(script, '--wake')
    run(script, '--idle-off')
    active = monitors()
    assert all(m['dpmsStatus'] == (m['name'] == 'RMT-1') for m in active), active
    assert next(m['name'] for m in active if m['focused']) == 'RMT-1'
    assert json.loads(run('hyprctl', '-j', 'getoption', 'misc:mouse_move_enables_dpms'))['bool'] is False
    assert json.loads(run('hyprctl', '-j', 'getoption', 'cursor:no_warps'))['bool'] is True
    print('Remote focus, DPMS suppression and idle guards: PASS', flush=True)
    run(script, '--restore')
    after = monitors()
    assert next(m['name'] for m in after if m['focused']) == focus_before
    print('Cursor before:', cursor_before, 'after:', json.loads(run('hyprctl', '-j', 'cursorpos')), flush=True)
    assert json.loads(run('hyprctl', '-j', 'cursorpos')) == cursor_before
    for key, value in options_before.items():
        assert json.loads(run('hyprctl', '-j', 'getoption', key))['bool'] == value['bool']
    assert {m['name']: m['dpmsStatus'] for m in after} == {m['name']: m['dpmsStatus'] for m in ready}
    print('Original focus, cursor, DPMS and options restored: PASS', flush=True)
    run(script, '--remove-output')
    assert not any(m['name'] == 'RMT-1' for m in monitors())
    print('Output cleanup: PASS', flush=True)
    from remote_desktop_protocol import check_streams
    check_streams(root, env, script, run, monitors)
finally:
    if signature_file.exists():
        try:
            run(script, '--restore')
        except Exception as error:
            print('Cleanup:', error)
    compositor.terminate()
    try:
        compositor.wait(timeout=10)
    except subprocess.TimeoutExpired:
        compositor.kill()
        compositor.wait()
