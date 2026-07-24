import PowerProfiles from 'gi://AstalPowerProfiles';

let power: PowerProfiles.PowerProfiles | null = null;
try {
  power = PowerProfiles.get_default();
} catch (e) {
  console.error('AstalPowerProfiles is not available:', e);
}

export function getPowerProfile() {
  return power;
}

export function cyclePowerProfile() {
  if (!power) return;
  const current = power.activeProfile;
  const profiles = power.get_profiles().map((p) => p.profile);
  const idx = profiles.indexOf(current);
  if (idx !== -1 && profiles.length > 0) {
    power.activeProfile = profiles[(idx + 1) % profiles.length];
  }
}

export function getPowerIcon(profile: string): string {
  if (profile === 'power-saver') return 'leaf';
  if (profile === 'performance') return 'zap';
  return 'gauge';
}

export function getPowerLabel(profile: string): string {
  if (profile === 'power-saver') return 'Power Saver';
  if (profile === 'performance') return 'Performance';
  return 'Balanced';
}

export function setPowerProfile(mode: string): string {
  if (!power) return 'Error: AstalPowerProfiles not available';

  const current = power.activeProfile;
  const profiles = power.get_profiles().map((p) => p.profile);

  if (!profiles.includes(mode)) {
    return `Error: Invalid profile '${mode}'. Available: ${profiles.join(', ')}`;
  }

  if (current === mode) {
    return `Already in ${mode} mode`;
  }

  power.activeProfile = mode;
  return `Changed from ${current} to ${mode}`;
}
