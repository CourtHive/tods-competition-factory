import { generateTimeSlots } from './generateTimeSlots';
import {
  addMinutes,
  minutesDifference,
  sameDay,
  timeToDate,
} from '../../../../utilities/dateTime';

export function courtsAvailableAtPeriodStart({
  includeBookingTypes,
  averageMatchUpTime,
  periodStart,
  courts,
  date,
}) {
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpTime);

  const availableCourts = courts.filter((court) => {
    const available =
      Array.isArray(court.dateAvailability) &&
      court.dateAvailability.filter(sameDate).filter(enoughTime);
    return !!available.length;
  });

  const available = availableCourts.map((court) => ({
    locationId: court.locationId,
    identifier: court.identifier,
  }));
  return { available, count: available.length };

  function sameDate(courtDate) {
    return sameDay(courtDate.date, date);
  }
  function enoughTime(courtDate) {
    const timeSlots = generateTimeSlots({ courtDate, includeBookingTypes });
    const availableTimeSlots = timeSlots.filter(validTimeSlot);
    return !!availableTimeSlots.length;
  }

  function validTimeSlot(timeSlot) {
    const [startHours, startMinutes] = timeSlot.startTime.split(':');
    const slotStartTime = new Date().setHours(startHours, startMinutes, 0, 0);
    const [endHours, endMinutes] = timeSlot.endTime.split(':');
    const slotEndTime = new Date().setHours(
      parseInt(endHours),
      parseInt(endMinutes),
      0,
      0
    );
    if (slotStartTime > periodStartTime) {
      return false;
    }
    if (slotEndTime < periodEndTime) {
      return false;
    }

    const timeSlotMinutes = minutesDifference(slotStartTime, slotEndTime);
    return timeSlotMinutes > averageMatchUpTime;
  }
}
