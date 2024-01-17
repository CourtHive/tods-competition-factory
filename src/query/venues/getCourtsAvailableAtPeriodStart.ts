import { checkRequiredParameters } from '../../parameters/checkRequiredParameters';
import { getCourtDateAvailability } from './getCourtDateAvailability';
import { addMinutes, timeToDate } from '../../tools/dateTime';
import { getEnoughTime } from './getEnoughTime';

import { ResultType } from '../../global/functions/decorateResult';
import { ARRAY } from '../../constants/attributeConstants';
import { SUCCESS } from '../../constants/resultConstants';
import { Court } from '../../types/tournamentTypes';

type GetCourtsAvailableAtPeriodStartArgs = {
  averageMatchUpMinutes: number;
  includeBookingTypes?: boolean;
  periodStart: string;
  courts: any[];
  date: string;
};
export function getCourtsAvailableAtPeriodStart(params: GetCourtsAvailableAtPeriodStartArgs): ResultType & {
  availableToScheduleCount?: number;
} {
  const paramsCheck = checkRequiredParameters(params, [
    { periodStart: true, date: true },
    { courts: true, _ofType: ARRAY },
  ]);
  if (paramsCheck.error) return paramsCheck;

  const { averageMatchUpMinutes, includeBookingTypes, periodStart, date } = params;
  const courts = params.courts as Court[];
  const periodStartTime = timeToDate(periodStart);
  const periodEndTime = addMinutes(periodStartTime, averageMatchUpMinutes);

  const { enoughTime } = getEnoughTime({
    averageMatchUpMinutes,
    includeBookingTypes,
    periodStartTime,
    periodEndTime,
  });

  const availableCourts =
    courts?.filter((court) => {
      if (!Array.isArray(court.dateAvailability)) return false;
      const courtDate = getCourtDateAvailability({ date, court });
      return !!(courtDate && enoughTime(courtDate));
    }) || [];

  return {
    availableToScheduleCount: availableCourts.length,
    ...SUCCESS,
  };
}
