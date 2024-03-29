import { weekdayConstants } from '@Constants/weekdayConstants';

export function isValidWeekdayValue(value) {
  return Object.keys(weekdayConstants).includes(value);
}
