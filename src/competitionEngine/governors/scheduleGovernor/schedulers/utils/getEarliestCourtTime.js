import { getCourtDateAvailability } from '../../garman/getCourtDateAvailability';
import { generateTimeSlots } from '../../garman/generateTimeSlots';
import { getTimeBoundary } from './getTimeBoundary';
import {
  extractTime,
  minutesDifference,
  timeToDate,
} from '../../../../../utilities/dateTime';

import { MISSING_VALUE } from '../../../../../constants/errorConditionConstants';

export function getEarliestCourtTime({
  averageMinutes,
  startTime,
  endTime,
  court,
  date,
}) {
  if (!Array.isArray(court.dateAvailability)) return { error: MISSING_VALUE };

  const courtStartTime = getTimeBoundary({
    scheduleDate: date,
    courts: [court],
    startTime: true,
  });
  const courtEndTime = getTimeBoundary({
    scheduleDate: date,
    courts: [court],
    endTime: true,
  });

  startTime = startTime || courtStartTime;
  endTime = endTime || courtEndTime;

  const courtDate = getCourtDateAvailability({ court, date });
  const timeSlots = generateTimeSlots({ courtDate });
  const dateStartTime = timeToDate(startTime);
  const dateEndTime = timeToDate(endTime);

  const earliestCourtTime = timeSlots.reduce((first, timeSlot) => {
    const timeSlotStartTime = timeToDate(timeSlot.startTime);
    const timeSlotEndTime = timeToDate(timeSlot.endTime);
    if (timeSlotStartTime > dateEndTime || timeSlotStartTime < dateStartTime)
      return first;
    if (timeSlotEndTime < dateStartTime) return first;
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

  return { earliestCourtTime, courtStartTime, courtEndTime };
}
