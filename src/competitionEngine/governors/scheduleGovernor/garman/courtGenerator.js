import { generateRange } from '../../../../utilities';

export function courtGenerator({
  startTime = '8:00',
  endTime = '20:30',
  count = 10,
  date,
} = {}) {
  return generateRange(0, count).map(() => ({
    dateAvailability: [{ date, startTime, endTime }],
  }));
}
