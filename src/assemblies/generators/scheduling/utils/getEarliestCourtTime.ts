import { generateTimeSlots } from '@Assemblies/generators/scheduling/generateTimeSlots';
import { getCourtDateAvailability } from '@Query/venues/getCourtDateAvailability';
import { extractTime, minutesDifference, timeToDate } from '@Tools/dateTime';
import { getDateTimeBoundary } from './getTimeBoundary';

// constants
import { MISSING_VALUE } from '@Constants/errorConditionConstants';

type GetEarliestCourtTimeArgs = {
  averageMinutes: number;
  startTime?: string;
  endTime?: string;
  court: any;
  date: string;
};
export function getEarliestCourtTime({ averageMinutes, startTime, endTime, court, date }: GetEarliestCourtTimeArgs) {
  if (!Array.isArray(court.dateAvailability)) return { error: MISSING_VALUE, stack: 'getEarliestCourtTime' };

  const courtStartTime = getDateTimeBoundary({
    scheduleDate: date,
    courts: [court],
    startTime: true,
  });
  const courtEndTime = getDateTimeBoundary({
    scheduleDate: date,
    courts: [court],
    endTime: true,
  });

  startTime = startTime || courtStartTime;
  endTime = endTime || courtEndTime;

  const courtDate = getCourtDateAvailability({ court, date });
  const { timeSlots } = generateTimeSlots({ courtDate });
  const dateStartTime = timeToDate(startTime);
  const dateEndTime = timeToDate(endTime);

  const earliestCourtTime = timeSlots?.reduce((first, timeSlot) => {
    const timeSlotStartTime = timeToDate(timeSlot.startTime);
    const timeSlotEndTime = timeToDate(timeSlot.endTime);
    if (timeSlotStartTime > dateEndTime || timeSlotEndTime < dateStartTime) {
      return first;
    }
    const consideredStartTime = dateStartTime > timeSlotStartTime ? dateStartTime : timeSlotStartTime;
    const timeSlotMinutes = minutesDifference(consideredStartTime, timeSlotEndTime);
    const available = timeSlotMinutes >= averageMinutes;
    if (available) {
      const timeString = extractTime(consideredStartTime.toISOString());
      if (timeString && (!first || timeString < first)) first = timeString;
    }
    return first;
  }, undefined);

  return { earliestCourtTime, courtStartTime, courtEndTime };
}
