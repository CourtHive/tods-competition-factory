import { addMinutes, timeToDate } from '../../../../utilities/dateTime';
import { getCourtDateFilters } from './courtDateFilters';

export function getCourtsAvailableAtPeriodStart({
  includeBookingTypes,
  averageMatchUpMinutes,
  periodStart,
  courts,
  date,
}) {
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpMinutes);

  const { sameDate, enoughTime } = getCourtDateFilters({
    includeBookingTypes,
    averageMatchUpMinutes,
    periodStartTime,
    periodEndTime,
    date,
  });

  const availableCourts = courts.filter((court) => {
    const available =
      Array.isArray(court.dateAvailability) &&
      court.dateAvailability.filter(sameDate).filter(enoughTime);
    return !!available.length;
  });

  return {
    availableToScheduleCount: availableCourts.length,
  };
}
