import { execAsync } from 'ags/process';

import Apps from 'gi://AstalApps';
import GLib from 'gi://GLib';
import Gio from 'gi://Gio';

const CACHE_DIR = `${GLib.get_user_cache_dir()}/ags`;
const HISTORY_FILE = `${CACHE_DIR}/app_history.json`;

let appHistory: Record<string, number> = {};

export function loadAppHistory() {
  try {
    const file = Gio.File.new_for_path(HISTORY_FILE);
    if (file.query_exists(null)) {
      const [ok, contents] = file.load_contents(null);
      if (ok) {
        appHistory = JSON.parse(new TextDecoder().decode(contents));
      }
    }
  } catch (e) {
    console.error('Failed to load app history', e);
  }
}

export function saveAppHistory() {
  try {
    const file = Gio.File.new_for_path(HISTORY_FILE);
    const parent = file.get_parent();
    if (parent && !parent.query_exists(null)) {
      parent.make_directory_with_parents(null);
    }
    const contents = new TextEncoder().encode(JSON.stringify(appHistory));
    file.replace_contents(contents, null, false, Gio.FileCreateFlags.NONE, null);
  } catch (e) {
    console.error('Failed to save app history', e);
  }
}

export function recordAppLaunch(app: Apps.Application) {
  const key = app.executable || app.name;
  if (!key) return;
  for (const k in appHistory) {
    appHistory[k] *= 0.99;
  }
  appHistory[key] = (appHistory[key] || 0) + 1;
  saveAppHistory();
}

// Load initially
loadAppHistory();

const apps = new Apps.Apps();

export function getAppList() {
  return apps.get_list().sort((a, b) => {
    const keyA = a.executable || a.name;
    const keyB = b.executable || b.name;
    const scoreA = appHistory[keyA] || 0;
    const scoreB = appHistory[keyB] || 0;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return (a.name || '').localeCompare(b.name || '');
  });
}

export function searchApps(q: string) {
  const allApps = getAppList();
  if (q === '') return allApps;
  const keywords = q.split(/\s+/);

  const results = allApps
    .map((appItem) => {
      const name = (appItem.name || '').toLowerCase();
      const desc = (appItem.description || '').toLowerCase();
      const exec = (appItem.executable || '').toLowerCase();
      const searchString = name + ' ' + desc + ' ' + exec;

      let score = 0;
      if (name.startsWith(q)) score += 100;
      else if (name.includes(q)) score += 50;
      else if (exec.includes(q)) score += 30;
      else if (desc.includes(q)) score += 10;

      const matchesAll = keywords.every((kw) => searchString.includes(kw));
      if (!matchesAll) score = 0;

      const key = appItem.executable || appItem.name;
      const historyScore = appHistory[key] || 0;
      if (score > 0) {
        score += historyScore * 10;
      }

      return { app: appItem, score };
    })
    .filter((x) => x.score > 0);

  results.sort((a, b) => b.score - a.score);
  return results.map((x) => x.app).slice(0, 30); // LIMIT TO 30 APPS TO SAVE MEMORY
}

export function searchWeb(query: string) {
  execAsync(['xdg-open', `https://google.com/search?q=${encodeURIComponent(query)}`]).catch(
    () => {},
  );
}
