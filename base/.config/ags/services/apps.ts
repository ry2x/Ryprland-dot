import { execAsync } from 'ags/process';

import Apps from 'gi://AstalApps';

const apps = new Apps.Apps();

export function getAppList() {
  return apps.get_list();
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
