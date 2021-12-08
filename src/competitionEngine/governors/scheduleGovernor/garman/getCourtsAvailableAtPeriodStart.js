import { addMinutes, timeToDate } from '../../../../utilities/dateTime';
import { getCourtDateAvailability } from './getCourtDateAvailability';
import { getCourtDateFilters } from './courtDateFilters';

export function getCourtsAvailableAtPeriodStart({
  includeBookingTypes,
  averageMatchUpMinutes,
  periodLength,
  periodStart,
  courts,
  date,
}) {
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpMinutes);

  const { enoughTime } = getCourtDateFilters({
    includeBookingTypes,
    averageMatchUpMinutes,
    periodStartTime,
    periodEndTime,
    periodLength,
    date,
  });

  const availableCourts = courts.filter((court) => {
    if (!Array.isArray(court.dateAvailability)) return false;
    const courtDate = getCourtDateAvailability({ date, court });
    return !!(courtDate && enoughTime(courtDate));
  });

  return {
    availableToScheduleCount: availableCourts.length,
  };
}
