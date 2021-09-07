import { getMatchUpFormatRecoveryTimes } from './getMatchUpFormatRecoveryTimes';
import { getMatchUpFormatAverageTimes } from './getMatchUpFormatAverageTimes';
import { getScheduleTiming } from './getScheduleTiming';
import { MISSING_TOURNAMENT_RECORD } from '../../../../constants/errorConditionConstants';
import { SINGLES } from '../../../../constants/matchUpTypes';
import {
  DOUBLES_SINGLES,
  SINGLES_DOUBLES,
} from '../../../../constants/scheduleConstants';

/**
 * find the policy-defined average matchUp time for a given category
 *
 * @param {object} tournamentRecord - supplied by tournamentEngine when state is set
 * @param {string} drawId - resolved to drawDefinition by tournamentEngine
 * @param {string} eventId - resolved to event by tournamentEngine
 * @param {string} matchUpFormat
 *
 * @returns { averageMinutes, recoveryMinutes };
 */
export function getMatchUpFormatTiming({
  defaultAverageMinutes = 90,
  defaultRecoveryMinutes = 0,
  tournamentRecord,
  matchUpFormat,
  categoryName,
  categoryType,
  eventType,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  // event is optional, so eventType can also be passed in directly
  eventType = eventType || event?.eventType;
  const defaultTiming = {
    averageTimes: [{ minutes: { default: defaultAverageMinutes } }],
    recoveryTimes: [{ minutes: { default: defaultRecoveryMinutes } }],
  };

  const { scheduleTiming } = getScheduleTiming({
    tournamentRecord,
    categoryName,
    categoryType,
    event,
  });

  const timingDetails = {
    ...scheduleTiming,
    matchUpFormat,
    categoryType,
    defaultTiming,
  };

  return matchUpFormatTimes({ eventType, timingDetails });
}

export function matchUpFormatTimes({ eventType, timingDetails }) {
  const averageTimes = getMatchUpFormatAverageTimes(timingDetails);
  const averageKeys = Object.keys(averageTimes?.minutes || {});

  const averageMinutes =
    averageTimes?.minutes &&
    ((averageKeys?.includes(eventType) && averageTimes.minutes[eventType]) ||
      averageTimes.minutes.default);

  const recoveryTimes = getMatchUpFormatRecoveryTimes({
    ...timingDetails,
    averageMinutes,
  });

  const recoveryKeys = Object.keys(recoveryTimes?.minutes || {});
  const recoveryMinutes =
    recoveryTimes?.minutes &&
    ((recoveryKeys?.includes(eventType) && recoveryTimes.minutes[eventType]) ||
      recoveryTimes.minutes.default);

  const formatChangeKey =
    eventType === SINGLES ? SINGLES_DOUBLES : DOUBLES_SINGLES;

  const formatChangeRecoveryMinutes =
    recoveryTimes?.minutes &&
    ((recoveryKeys?.includes(formatChangeKey) &&
      recoveryTimes.minutes[formatChangeKey]) ||
      recoveryTimes.minutes.default);

  return { averageMinutes, recoveryMinutes, formatChangeRecoveryMinutes };
}
