"""Temporary authenticated GameStream client for lifecycle integration tests."""

import http.client
import json
import os
from pathlib import Path
import socket
import ssl
import subprocess
import time
from urllib.parse import urlencode
import uuid
import xml.etree.ElementTree as ET


def check_streams(root, env, script, run, monitors):
    cfg = root / 'config/sunshine'
    cfg.mkdir(parents=True)
    env['XDG_CONFIG_HOME'] = str(cfg.parent)
    key = root / 'client.key'
    cert = root / 'client.crt'
    run('openssl', 'req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-days', '1', '-subj', '/CN=RyprlandTest', '-keyout', str(key), '-out', str(cert))
    identity = str(uuid.uuid4())
    (cfg / 'sunshine_state.json').write_text(json.dumps({'root': {'uniqueid': str(uuid.uuid4()), 'named_devices': [{'name': 'Test client', 'uuid': identity, 'enabled': True, 'cert': cert.read_text()}]}}))
    (cfg / 'apps.json').write_text(json.dumps({'env': {}, 'apps': [{'name': 'Desktop'}]}))
    # The service must override the normal tray default itself; hiding it here
    # previously missed Qt/portal deadlocks in production stream startup/teardown.
    (cfg / 'sunshine.conf').write_text('port = 51089\nbind_address = 127.0.0.1\nping_timeout = 2000\nlan_encryption_mode = 0\nsunshine_name = Ryprland Test\nsystem_tray = enabled\n')
    run(script, '--prepare')
    before = {m['name']: m['dpmsStatus'] for m in monitors()}
    context = ssl._create_unverified_context()
    context.load_cert_chain(str(cert), str(key))
    log = (root / 'sunshine.log').open('w')
    server = subprocess.Popen([script, '--serve'], env=env, stdout=log, stderr=log)

    def request(path, args=None):
        connection = http.client.HTTPSConnection('127.0.0.1', 51084, context=context, timeout=10)
        connection.request('GET', path + '?' + urlencode({'uniqueid': identity, **(args or {})}))
        response = connection.getresponse()
        body = response.read()
        connection.close()
        assert response.status == 200, (response.status, body)
        tree = ET.fromstring(body)
        assert tree.attrib.get('status_code') == '200', (path, body)
        return tree

    def wait(predicate, description, timeout=15):
        deadline = time.monotonic() + timeout
        while time.monotonic() < deadline:
            if predicate():
                return
            if server.poll() is not None:
                raise RuntimeError('Test Sunshine exited: ' + (root / 'sunshine.log').read_text()[-5000:])
            time.sleep(.05)
        raise AssertionError(description + '\n' + (root / 'sunshine.log').read_text()[-5000:])

    def status():
        return json.loads(run(script, '--status'))

    def announce(url):
        attrs = {
            'x-nv-audio.surround.numChannels': 2, 'x-nv-audio.surround.channelMask': 3,
            'x-nv-audio.surround.AudioQuality': 0, 'x-nv-video[0].packetSize': 1024,
            'x-ml-general.featureFlags': 0, 'x-nv-video[0].clientViewportHt': 1080,
            'x-nv-video[0].clientViewportWd': 1920, 'x-nv-video[0].maxFPS': 60,
            'x-nv-vqos[0].bw.maximumBitrateKbps': 1000, 'x-nv-video[0].videoEncoderSlicesPerFrame': 1,
            'x-nv-video[0].maxNumReferenceFrames': 1
        }
        body = ('v=0\r\ns=Ryprland Test\r\n' + ''.join(f'a={k}:{v}\r\n' for k, v in attrs.items())).encode()
        message = (f'ANNOUNCE {url} RTSP/1.0\r\nCSeq: 1\r\nSession: DEADBEEFCAFE\r\nContent-Type: application/sdp\r\nContent-length: {len(body)}\r\n\r\n').encode() + body
        with socket.create_connection(('127.0.0.1', 51110), timeout=10) as sock:
            sock.sendall(message)
            data = sock.recv(65536)
        assert data.startswith(b'RTSP/1.0 200'), data

    args = {'rikey': os.urandom(16).hex(), 'rikeyid': 1, 'localAudioPlayMode': 0, 'mode': '1920x1080x60'}
    try:
        def ready():
            try:
                return request('/serverinfo') is not None
            except (ConnectionRefusedError, OSError):
                return False
        wait(ready, 'Waiting for Sunshine readiness', timeout=30)
        assert 'System tray created' not in (root / 'sunshine.log').read_text()
        appid = request('/applist').findtext('.//App/ID')
        assert appid
        launched = request('/launch', {**args, 'appid': appid})
        announce(launched.findtext('sessionUrl0'))
        wait(lambda: status()['sessions'] == 1, 'First stream did not enter isolation')
        assert all(m['dpmsStatus'] == (m['name'] == 'RMT-1') for m in monitors())
        run(script, '--wake')
        assert all(m['dpmsStatus'] == (m['name'] == 'RMT-1') for m in monitors())
        request('/cancel')
        wait(lambda: status()['mode'] == 'standby', 'Cancelled stream did not restore local state')
        assert {m['name']: m['dpmsStatus'] for m in monitors()} == before
        print('Real Sunshine launch/cancel and idle wake guard: PASS', flush=True)
        launched = request('/launch', {**args, 'appid': appid})
        announce(launched.findtext('sessionUrl0'))
        wait(lambda: status()['sessions'] == 1, 'Timeout stream did not enter isolation')
        time.sleep(.5)
        second = request('/resume', args)
        announce(second.findtext('sessionUrl0'))
        wait(lambda: status()['sessions'] == 2, 'Second stream was not counted')
        wait(lambda: status()['sessions'] == 1, 'First timeout was not counted')
        assert all(m['dpmsStatus'] == (m['name'] == 'RMT-1') for m in monitors())
        wait(lambda: status()['mode'] == 'standby', 'Network timeout did not restore local state')
        assert {m['name']: m['dpmsStatus'] for m in monitors()} == before
        print('Real Sunshine network timeout restoration: PASS', flush=True)
        resumed = request('/resume', args)
        announce(resumed.findtext('sessionUrl0'))
        wait(lambda: status()['sessions'] == 1, 'Reconnect did not enter isolation')
        server.terminate()
        server.wait(timeout=15)
        assert status()['mode'] == 'standby'
        assert {m['name']: m['dpmsStatus'] for m in monitors()} == before
        print('Real Sunshine reconnect and supervisor termination restoration: PASS', flush=True)
        assert 'Debug:' not in (root / 'sunshine.log').read_text()
        print('Sunshine debug log redaction: PASS', flush=True)
    finally:
        if server.poll() is None:
            server.terminate()
            try:
                server.wait(timeout=15)
            except subprocess.TimeoutExpired:
                server.kill()
                server.wait()
        log.close()
        run(script, '--restore')
        run(script, '--remove-output')
