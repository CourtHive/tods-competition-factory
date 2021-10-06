import { timeStringMinutes } from '../../../../utilities/dateTime';

export function hasScheduleOverlap(a, b) {
  const startA = timeStringMinutes(a.scheduleTime);
  const endA = timeStringMinutes(a.timeAfterRecovery);
  const startB = timeStringMinutes(b.scheduleTime);
  const endB = timeStringMinutes(b.timeAfterRecovery);

  if (startA === startB || endA === endB) return true;
  if (startA > startB && startA < endB) return true;
  if (endA > startB && endA < endB) return true;
}
