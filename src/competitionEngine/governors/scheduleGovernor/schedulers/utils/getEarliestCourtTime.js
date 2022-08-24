import { getCourtDateAvailability } from '../../garman/getCourtDateAvailability';
import { generateTimeSlots } from '../../garman/generateTimeSlots';
import { getTimeBoundary } from './getTimeBoundary';
import {
  extractTime,
  minutesDifference,
  timeToDate,
} from '../../../../../utilities/dateTime';

export function getEarliestCourtTime({
  averageMinutes,
  startTime,
  endTime,
  court,
  date,
}) {
  startTime =
    startTime ||
    getTimeBoundary({ startTime: true, scheduleDate: date, courts: [court] });
  endTime =
    endTime ||
    getTimeBoundary({ endTime: true, scheduleDate: date, courts: [court] });
  const dateStartTime = timeToDate(startTime);
  const dateEndTime = timeToDate(endTime);
  if (!Array.isArray(court.dateAvailability)) return false;
  const courtDate = getCourtDateAvailability({ court, date });
  const timeSlots = generateTimeSlots({ courtDate });
  const earliestCourtTime = timeSlots.reduce((first, timeSlot) => {
    const timeSlotStartTime = timeToDate(timeSlot.startTime);
    const timeSlotEndTime = timeToDate(timeSlot.endTime);
    if (timeSlotStartTime > dateEndTime || timeSlotStartTime < dateStartTime)
      return false;
    if (timeSlotEndTime < dateStartTime) return false;
    const timeSlotMinutes = minutesDifference(
      timeSlotStartTime,
      timeSlotEndTime
    );
    const available = timeSlotMinutes >= averageMinutes;
    if (available) {
      const timeString = extractTime(timeSlotStartTime.toISOString());
      if (!first || timeString < first) first = timeString;
    }
    return first;
  }, undefined);

  return { earliestCourtTime };
}
