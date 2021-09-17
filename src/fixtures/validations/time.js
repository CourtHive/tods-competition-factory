import { timeValidation } from './regex';

export function validTimePeriod({ startTime, endTime } = {}) {
  if (!timeValidation.test(startTime) || !timeValidation.test(endTime))
    return false;

  const [startHour, startMinute] = startTime.split(':');
  const [endHour, endMinute] = endTime.split(':');

  if (endHour < startHour) return false;
  if (startHour === endHour && endMinute < startMinute) return false;
  return true;
}
