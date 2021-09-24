import { getCourtDateFilters } from './courtDateFilters';
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
  const { sameDate } = getCourtDateFilters({ date });
  // find the first timeSlot across all courts between startTime and endTime that can accommodate averageMatchUpMinutes
  let firstTimeSlotStartTime;
  if (startTime && endTime) {
    const dateStartTime = timeToDate(startTime);
    const dateEndTime = timeToDate(endTime);
    courts.every((court) => {
      if (!Array.isArray(court.dateAvailability)) return false;
      const dateAvailability = court.dateAvailability.filter(sameDate);
      return dateAvailability.find((courtDate) => {
        const timeSlots = generateTimeSlots({ courtDate });
        return timeSlots.find((timeSlot) => {
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
            if (
              !firstTimeSlotStartTime ||
              timeString < firstTimeSlotStartTime
            ) {
              firstTimeSlotStartTime = timeString;
            }
          }
          return available;
        });
      });
    });
  }

  return { firstTimeSlotStartTime };
}
