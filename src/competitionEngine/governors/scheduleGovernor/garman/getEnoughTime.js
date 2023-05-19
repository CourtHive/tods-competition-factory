import { minutesDifference, timeToDate } from '../../../../utilities/dateTime';
import { generateTimeSlots } from './generateTimeSlots';

export function getEnoughTime({
  includeBookingTypes,
  averageMatchUpMinutes,
  periodStartTime,
  periodEndTime,
  periodLength,
}) {
  const enoughTime = (courtDate) => {
    const timeSlots = generateTimeSlots({
      includeBookingTypes,
      periodLength,
      courtDate,
    });
    const availableTimeSlots = timeSlots.filter(validTimeSlot);
    return !!availableTimeSlots.length;
  };

  function validTimeSlot(timeSlot) {
    const slotStartTime = timeToDate(timeSlot.startTime);
    const slotEndTime = timeToDate(timeSlot.endTime);
    if (slotStartTime > periodStartTime) return false;
    if (slotEndTime < periodEndTime) return false;

    const timeSlotMinutes = minutesDifference(periodStartTime, slotEndTime);
    return timeSlotMinutes >= averageMatchUpMinutes;
  }

  return { enoughTime };
}
