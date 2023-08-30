import { getVenuesAndCourts } from '../../../../getters/venuesAndCourtsGetter';
import { getScheduleTimes } from '../../garman/getScheduleTimes';
import { calculatePeriodLength } from './calculatePeriodLength';
import { getDateTimeBoundary } from './getTimeBoundary';
import { generateBookings } from './generateBookings';

import {
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '../../../../../constants/errorConditionConstants';

import { ScheduleTimesResult } from '../../../../../types/factoryTypes';
import { Tournament } from '../../../../../types/tournamentFromSchema';
import { HydratedMatchUp } from '../../../../../types/hydrated';
import { extractAttributes } from '../../../../../utilities';

/**
 *
 * @param {object[]} tournamentRecords - passed in by competitionEngine
 * @param {string[]} venueIds - optional - look for availaiblity only courts at specified venues
 * @param {boolean} calculateStartTimeFromCourts - defaults to true - will override supplied startTime
 * @param {string} startTime - military time string, time only, e.g. '08:00'
 * @param {string} endTime - military time string, time only, e.g. '18:00'
 * @param {string} scheduleDate - date string 'YYYY-MM-DD'
 *
 * NOTE: not using matchUpFormat here because time per format is defined by policy
 * @param {number} averageMatchUpMinutes - number of minutes per match
 * @param {number} periodLengh - number of minutes in a scheduling period
 * @returns
 */

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
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  periodLength =
    periodLength ||
    calculatePeriodLength({
      recoveryMinutes: defaultRecoveryMinutes,
      averageMatchUpMinutes,
    });

  const { courts: allCourts, venues } = getVenuesAndCourts({
    dates: [scheduleDate],
    ignoreDisabled: true,
    tournamentRecords,
  });

  const courts =
    allCourts?.filter(
      (court) => !venueIds || venueIds.includes(court.venueId)
    ) || [];

  startTime =
    startTime || getDateTimeBoundary({ courts, scheduleDate, startTime: true });
  endTime =
    endTime || getDateTimeBoundary({ courts, scheduleDate, endTime: true });

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
  const venueId =
    (venueIds?.length === 1 && venueIds[0]) ||
    (venues?.length === 1 && venues[0].venueId) ||
    undefined;

  const dateScheduledMatchUpIds = dateScheduledMatchUps?.map(
    extractAttributes('matchUpId')
  );

  return {
    dateScheduledMatchUpIds,
    dateScheduledMatchUps,
    scheduleTimes,
    venueId,
  };
}
