import { getMatchUpFormatRecoveryTimes } from './getMatchUpFormatRecoveryTimes';
import { getMatchUpFormatAverageTimes } from './getMatchUpFormatAverageTimes';
import { findPolicy } from '../../policyGovernor/findPolicy';
import {
  findEventExtension,
  findTournamentExtension,
} from '../../queryGovernor/extensionQueries';

import { MISSING_TOURNAMENT_RECORD } from '../../../../constants/errorConditionConstants';
import { POLICY_TYPE_SCHEDULING } from '../../../../constants/policyConstants';
import { SCHEDULE_TIMING } from '../../../../constants/extensionConstants';

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
  defaultAverageMinutes,
  defaultRecoveryMinutes,
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
  categoryName =
    categoryName ||
    event?.category?.categoryName ||
    event?.category?.ageCategoryCode;

  const { policy } = findPolicy({
    tournamentRecord,
    event,
    policyType: POLICY_TYPE_SCHEDULING,
  });

  const defaultTiming = {
    averageTimes: [{ minutes: { default: defaultAverageMinutes } }],
    recoveryTimes: [{ minutes: { default: defaultRecoveryMinutes } }],
  };

  const { extension: tournamentExtension } = findTournamentExtension({
    tournamentRecord,
    name: SCHEDULE_TIMING,
  });
  const tournamentScheduling = tournamentExtension?.value;

  const { extension: eventExtension } = findEventExtension({
    event,
    name: SCHEDULE_TIMING,
  });
  const eventScheduling = eventExtension?.value;

  const timingDetails = {
    matchUpFormat,
    categoryName,
    categoryType,

    eventScheduling,
    tournamentScheduling,
    defaultTiming,
    policy,
  };

  const averageTimes = getMatchUpFormatAverageTimes(timingDetails);
  const averageKeys = Object.keys(averageTimes?.minutes || {});

  const averageMinutes =
    (averageKeys?.includes(eventType) && averageTimes.minutes[eventType]) ||
    averageTimes?.minutes?.default;

  const recoveryTimes = getMatchUpFormatRecoveryTimes({
    ...timingDetails,
    averageMinutes,
  });

  const recoveryKeys = Object.keys(recoveryTimes?.minutes || {});
  const recoveryMinutes =
    (recoveryKeys?.includes(eventType) && recoveryTimes.minutes[eventType]) ||
    recoveryTimes.minutes.default;

  return { averageMinutes, recoveryMinutes };
}
