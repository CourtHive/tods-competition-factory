import { getVenuesAndCourts } from '@Query/venues/venuesAndCourtsGetter';
import { getScheduleTimes } from '@Query/venues/getScheduleTimes';
import { calculatePeriodLength } from './calculatePeriodLength';
import { getDateTimeBoundary } from './getTimeBoundary';
import { generateBookings } from './generateBookings';
import { xa } from '@Tools/extractAttributes';

// constants and types
import { ErrorType, MISSING_TOURNAMENT_RECORDS } from '@Constants/errorConditionConstants';
import { ScheduleTimesResult } from '@Types/factoryTypes';
import { Tournament } from '@Types/tournamentTypes';
import { HydratedMatchUp } from '@Types/hydrated';

type GenerateScheduleTimesArgs = {
  tournamentRecords?: { [key: string]: Tournament };
  calculateStartTimeFromCourts?: boolean;
  remainingScheduleTimes?: string[];
  defaultRecoveryMinutes?: number;
  averageMatchUpMinutes?: number;
  tournamentRecord?: Tournament;
  clearScheduleDates?: boolean;
  matchUps?: HydratedMatchUp[];
  periodLength?: number;
  scheduleDate: string;
  venueIds: string[];
  startTime?: string;
  endTime?: string;
};

export function generateScheduleTimes({
  calculateStartTimeFromCourts = true,
  remainingScheduleTimes,
  defaultRecoveryMinutes,
  averageMatchUpMinutes,
  clearScheduleDates,
  tournamentRecords,
  tournamentRecord,
  periodLength,
  scheduleDate,
  startTime,
  venueIds,
  matchUps,
  endTime,
}: GenerateScheduleTimesArgs): {
  dateScheduledMatchUps?: HydratedMatchUp[];
  scheduleTimes?: ScheduleTimesResult[];
  dateScheduledMatchUpIds?: string[];
  error?: ErrorType;
  venueId?: string;
} {
  if (tournamentRecord && !tournamentRecords) {
    tournamentRecords = { [tournamentRecord.tournamentId]: tournamentRecord };
  }
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  periodLength =
    periodLength ??
    calculatePeriodLength({
      recoveryMinutes: defaultRecoveryMinutes,
      averageMatchUpMinutes,
    });

  const { courts: allCourts, venues } = getVenuesAndCourts({
    dates: [scheduleDate],
    ignoreDisabled: true,
    tournamentRecords,
  });

  const courts = allCourts?.filter((court) => !venueIds || venueIds.includes(court.venueId)) ?? [];

  startTime = startTime ?? getDateTimeBoundary({ courts, scheduleDate, startTime: true });
  endTime = endTime ?? getDateTimeBoundary({ courts, scheduleDate, endTime: true });

  const { bookings, dateScheduledMatchUps } = generateBookings({
    defaultRecoveryMinutes,
    averageMatchUpMinutes,
    tournamentRecords,
    scheduleDate,
    periodLength,
    venueIds,
    matchUps,
  });

  const timingParameters = {
    calculateStartTimeFromCourts,
    remainingScheduleTimes,
    averageMatchUpMinutes,
    clearScheduleDates,
    date: scheduleDate,
    periodLength,
    startTime,
    bookings,
    endTime,
    courts,
  };
  const { scheduleTimes } = getScheduleTimes(timingParameters);

  // if a single venue specified, or only one venue available, return venueId
  const venueId = (venueIds?.length === 1 && venueIds[0]) || (venues?.length === 1 && venues[0].venueId) || undefined;

  const dateScheduledMatchUpIds = dateScheduledMatchUps?.map(xa('matchUpId'));

  return {
    dateScheduledMatchUpIds,
    dateScheduledMatchUps,
    scheduleTimes,
    venueId,
  };
}
