import { generateTimeSlots } from './generateTimeSlots';
import {
  minutesDifference,
  sameDay,
  timeToDate,
} from '../../../../utilities/dateTime';

export function getCourtDateFilters({
  includeBookingTypes,
  averageMatchUpMinutes,
  periodStartTime,
  periodEndTime,
  date,
}) {
  const sameDate = (courtDate) => sameDay(courtDate.date, date);

  const enoughTime = (courtDate) => {
    const timeSlots = generateTimeSlots({ courtDate, includeBookingTypes });
    const availableTimeSlots = timeSlots.filter(validTimeSlot);
    const enough = !!availableTimeSlots.length;
    return enough;
  };

  function validTimeSlot(timeSlot) {
    const slotStartTime = timeToDate(timeSlot.startTime);
    const slotEndTime = timeToDate(timeSlot.endTime);
    if (slotStartTime > periodStartTime) return false;
    if (slotEndTime < periodEndTime) return false;

    const timeSlotMinutes = minutesDifference(periodStartTime, slotEndTime);
    return timeSlotMinutes >= averageMatchUpMinutes;
  }

  return { sameDate, enoughTime };
}
