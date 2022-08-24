import { getTimeBoundary } from '../schedulers/utils/getTimeBoundary';
import { getCourtDateAvailability } from './getCourtDateAvailability';
import { generateTimeSlots } from './generateTimeSlots';
import {
  extractTime,
  minutesDifference,
  timeToDate,
} from '../../../../utilities/dateTime';

export function getFirstTimeSlotStartTime({
  averageMinutes,
  startTime,
  endTime,
  courts,
  date,
}) {
  // find the first timeSlot across all courts between startTime and endTime that can accommodate averageMatchUpMinutes
  startTime =
    startTime ||
    getTimeBoundary({ courts, scheduleDate: date, startTime: true });
  endTime =
    endTime || getTimeBoundary({ courts, scheduleDate: date, endTime: true });

  let firstTimeSlotStartTime;
  if (startTime && endTime) {
    const dateStartTime = timeToDate(startTime);
    const dateEndTime = timeToDate(endTime);
    for (const court of courts) {
      if (!Array.isArray(court.dateAvailability)) return false;
      const courtDate = getCourtDateAvailability({ court, date });
      const timeSlots = generateTimeSlots({ courtDate });
      timeSlots.find((timeSlot) => {
        const timeSlotStartTime = timeToDate(timeSlot.startTime);
        const timeSlotEndTime = timeToDate(timeSlot.endTime);
        if (
          timeSlotStartTime > dateEndTime ||
          timeSlotStartTime < dateStartTime
        )
          return false;
        if (timeSlotEndTime < dateStartTime) return false;
        const timeSlotMinutes = minutesDifference(
          timeSlotStartTime,
          timeSlotEndTime
        );
        const available = timeSlotMinutes >= averageMinutes;
        if (available) {
          const timeString = extractTime(timeSlotStartTime.toISOString());
          if (!firstTimeSlotStartTime || timeString < firstTimeSlotStartTime) {
            firstTimeSlotStartTime = timeString;
          }
        }
        return available;
      });
    }
  }

  return { firstTimeSlotStartTime };
}
