import GLib from 'gi://GLib?version=2.0';

export interface AppConfig {
  weather: {
    location: string;
  };
  worldClocks: {
    label: string;
    tz: string;
  }[];
}

const DEFAULT_CONFIG: AppConfig = {
  weather: {
    location: 'Osaka',
  },
  worldClocks: [
    { label: 'London', tz: 'Europe/London' },
    { label: 'Brisbane', tz: 'Australia/Brisbane' },
    { label: 'New York', tz: 'America/New_York' },
    { label: 'Los Angeles', tz: 'America/Los_Angeles' },
  ],
};

function loadConfig(): AppConfig {
  try {
    const configDir = `${GLib.get_user_config_dir()}/ags`;
    const configPath = `${configDir}/config.json`;
    if (GLib.file_test(configPath, GLib.FileTest.EXISTS)) {
      const [success, bytes] = GLib.file_get_contents(configPath);
      if (success && bytes) {
        const jsonString = new TextDecoder('utf-8').decode(bytes);
        return { ...DEFAULT_CONFIG, ...JSON.parse(jsonString) };
      }
    }
  } catch (error) {
    console.error('Failed to load config.json:', error);
  }
  return DEFAULT_CONFIG;
}

export const appConfig = loadConfig();
