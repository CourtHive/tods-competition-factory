import { INVALID_TIME_ZONE } from '@Constants/errorConditionConstants';
import { isValidEmbargoDate } from '@Tools/dateTime';

export function isValidIANATimeZone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== 'string') return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone });
    return true;
  } catch {
    return false;
  }
}

export function getTimeZoneOffsetMinutes(timeZone: string, date?: Date): number {
  const d = date ?? new Date();
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    timeZoneName: 'longOffset',
  });

  const parts = formatter.formatToParts(d);
  const tzPart = parts.find((p) => p.type === 'timeZoneName');
  const offsetStr = tzPart?.value ?? '';

  // Format is "GMT" (for UTC) or "GMT+HH:MM" / "GMT-HH:MM"
  if (offsetStr === 'GMT') return 0;

  const match = offsetStr.match(/GMT([+-])(\d{2}):(\d{2})/);
  if (!match) return 0;

  const sign = match[1] === '+' ? 1 : -1;
  const hours = Number.parseInt(match[2], 10);
  const minutes = Number.parseInt(match[3], 10);
  return sign * (hours * 60 + minutes);
}

export function wallClockToUTC(
  date: string,
  time: string,
  timeZone: string,
): string | { error: typeof INVALID_TIME_ZONE } {
  if (!isValidIANATimeZone(timeZone)) return { error: INVALID_TIME_ZONE };

  const [hours, minutes] = time.split(':').map(Number);
  const [year, month, day] = date.split('-').map(Number);

  // Build a UTC date assuming the wall-clock values are in UTC, then adjust by offset
  const utcGuess = new Date(Date.UTC(year, month - 1, day, hours, minutes, 0, 0));

  // Get the offset at this approximate time
  const offsetMinutes = getTimeZoneOffsetMinutes(timeZone, utcGuess);

  // Wall clock = UTC + offset, so UTC = wall clock - offset
  const utcMs = utcGuess.getTime() - offsetMinutes * 60 * 1000;

  // Verify: the offset might differ at the actual UTC time (DST edge cases)
  const utcDate = new Date(utcMs);
  const verifyOffset = getTimeZoneOffsetMinutes(timeZone, utcDate);

  if (verifyOffset !== offsetMinutes) {
    // Re-adjust with the corrected offset
    const correctedMs = utcGuess.getTime() - verifyOffset * 60 * 1000;
    return new Date(correctedMs).toISOString();
  }

  return utcDate.toISOString();
}

export function utcToWallClock(
  utcIso: string,
  timeZone: string,
): { date: string; time: string } | { error: typeof INVALID_TIME_ZONE } {
  if (!isValidIANATimeZone(timeZone)) return { error: INVALID_TIME_ZONE };

  const d = new Date(utcIso);
  const formatter = new Intl.DateTimeFormat('en-CA', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });

  const parts = formatter.formatToParts(d);
  const get = (type: string) => parts.find((p) => p.type === type)?.value ?? '';

  const dateStr = `${get('year')}-${get('month')}-${get('day')}`;
  const hour = get('hour') === '24' ? '00' : get('hour');
  const timeStr = `${hour}:${get('minute')}`;

  return { date: dateStr, time: timeStr };
}

export function toEmbargoUTC(
  date: string,
  time: string,
  timeZone: string,
): string | { error: typeof INVALID_TIME_ZONE } {
  const result = wallClockToUTC(date, time, timeZone);
  if (typeof result !== 'string') return result;

  // wallClockToUTC already returns a string ending in Z via toISOString()
  if (!isValidEmbargoDate(result)) return { error: INVALID_TIME_ZONE };

  return result;
}

export const timeZone = {
  isValidIANATimeZone,
  getTimeZoneOffsetMinutes,
  wallClockToUTC,
  utcToWallClock,
  toEmbargoUTC,
};
