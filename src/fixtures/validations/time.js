import { timeValidation } from './regex';

function getInt(value) {
  return parseInt(value);
}

export function validTimePeriod({ startTime, endTime } = {}) {
  if (!timeValidation.test(startTime) || !timeValidation.test(endTime))
    return false;

  const [startHour, startMinute] = startTime.split(':').map(getInt);
  const [endHour, endMinute] = endTime.split(':').map(getInt);

  if (endHour < startHour) return false;
  if (startHour === endHour && endMinute < startMinute) return false;
  return true;
}

export function startTimeSort(a, b) {
  const [startHourA, startMinuteA] = a.startTime.split(':').map(getInt);
  const [startHourB, startMinuteB] = b.startTime.split(':').map(getInt);
  if (startHourA < startHourB) return -1;
  if (startHourA > startHourB) return 1;
  if (startMinuteA < startMinuteB) return -1;
  if (startMinuteA > startMinuteB) return 1;
  return 0;
}
