import { fetch } from 'ags/fetch';

import Mpris from 'gi://AstalMpris';
import GLib from 'gi://GLib?version=2.0';

export async function fetchYouTubeThumbnail(player: Mpris.Player): Promise<string | null> {
  const busName = player.bus_name;
  if (!busName) return null;

  let url = '';
  try {
    const metaVariant = player.get_meta('xesam:url');
    if (metaVariant) {
      url = metaVariant.get_string()[0];
    }
  } catch (e) {
    console.error('Failed to get xesam:url:', e);
  }

  if (!url.includes('youtube.com/watch?v=') && !url.includes('youtu.be/')) {
    return null;
  }

  let id = '';
  if (url.includes('youtu.be/')) {
    id = url.split('youtu.be/')[1].split('?')[0];
  } else {
    const match = url.match(/v=([^&]*)/);
    if (match) id = match[1];
  }

  if (!id) return null;

  const cacheDir = `${GLib.get_user_cache_dir()}/ags/media`;
  const localPath = `${cacheDir}/${id}.jpg`;
  let isDownloaded = GLib.file_test(localPath, GLib.FileTest.EXISTS);

  if (!isDownloaded) {
    GLib.mkdir_with_parents(cacheDir, 0o755);
    let res = await fetch(`https://img.youtube.com/vi/${id}/maxresdefault.jpg`);
    if (!res.ok) {
      res = await fetch(`https://img.youtube.com/vi/${id}/hqdefault.jpg`);
    }
    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      if (arrayBuffer) {
        const bytes = new Uint8Array(arrayBuffer);
        GLib.file_set_contents(localPath, bytes);
        isDownloaded = true;
      }
    }
  }

  return isDownloaded ? `file://${localPath}` : null;
}
