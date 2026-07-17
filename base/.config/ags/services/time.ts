import { createPoll } from 'ags/time';

const now = createPoll(Temporal.Now.zonedDateTimeISO(), 1000, () =>
  Temporal.Now.zonedDateTimeISO(),
);

export const clockTime = now.as(
  (t) => `${String(t.hour).padStart(2, '0')}:${String(t.minute).padStart(2, '0')}`,
);

export const clockTz = now.as(
  (t) =>
    new Intl.DateTimeFormat('en-US', { timeZoneName: 'short', timeZone: t.timeZoneId })
      .formatToParts(Date.now())
      .find((p) => p.type === 'timeZoneName')?.value ?? '',
);

export const clockDate = now.as((t) =>
  t.toLocaleString('en-US', { month: 'long', day: '2-digit', year: 'numeric' }),
);

export const clockDay = now.as((t) => t.toLocaleString('en-US', { weekday: 'long' }));

export const shortDate = now.as(
  (t) => `${String(t.month).padStart(2, '0')}/${String(t.day).padStart(2, '0')}`,
);

export const shortDay = now.as((t) => t.toLocaleString('en-US', { weekday: 'short' }));
