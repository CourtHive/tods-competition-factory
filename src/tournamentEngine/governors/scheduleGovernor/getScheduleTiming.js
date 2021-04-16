import { findPolicy } from '../policyGovernor/findPolicy';

import {
  INVALID_POLICY_DEFINITION,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../constants/errorConditionConstants';
import { POLICY_TYPE_SCHEDULING } from '../../../constants/policyConstants';

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
export function getScheduleTiming({
  defaultAverageMinutes = 90,
  defaultRecoveryMinutes = 60,
  tournamentRecord,
  matchUpFormat,
  categoryName,
  categoryType,
  eventType,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!event) return { error: MISSING_EVENT };

  const { policy } = findPolicy({
    tournamentRecord,
    event,
    policyType: POLICY_TYPE_SCHEDULING,
  });

  // TODO: first check if there are extensions matching these attributes
  // extensions will override any applied policies...
  const { defaultTimes, matchUpAverageTimes, matchUpRecoveryTimes } =
    policy || {};

  const averageTimes = (
    findMatchupFormatAverageTimes({
      matchUpAverageTimes,
      matchUpFormat,
    }) ||
    defaultTimes?.averageTimes || [
      { minutes: { default: defaultAverageMinutes } },
    ]
  )
    .sort(
      (a, b) => (b.categoryNames?.length || 0) - (a.categoryNames?.length || 0)
    )
    .find(({ categoryTypes, categoryNames }) => {
      return (
        (!categoryNames && !categoryTypes) ||
        (!categoryNames?.length && !categoryTypes?.length) ||
        categoryNames?.includes(categoryName) ||
        categoryTypes?.includes(categoryType)
      );
    });

  const averageKeys = Object.keys(averageTimes?.minutes || {});
  if (!averageKeys) return { error: INVALID_POLICY_DEFINITION };

  const averageMinutes =
    (averageKeys.includes(eventType) && averageTimes.minutes[eventType]) ||
    averageTimes?.minutes?.default ||
    defaultAverageMinutes;

  const times = (
    findMatchupFormatRecoveryTimes({
      matchUpRecoveryTimes,
      averageMinutes,
      matchUpFormat,
    }) ||
    defaultTimes?.recoveryTimes || [
      { minutes: { default: defaultRecoveryMinutes } },
    ]
  )
    .sort(
      (a, b) => (b.categoryNames?.length || 0) - (a.categoryNames?.length || 0)
    )
    .find(({ categoryTypes, categoryNames }) => {
      return (
        (!categoryNames && !categoryTypes) ||
        (!categoryNames?.length && !categoryTypes?.length) ||
        categoryNames.includes(categoryName) ||
        categoryTypes.includes(categoryType)
      );
    });

  const recoveryKeys = Object.keys(times?.minutes || {});
  if (!recoveryKeys) return { error: INVALID_POLICY_DEFINITION };

  const recoveryMinutes =
    (recoveryKeys.includes(eventType) && times.minutes[eventType]) ||
    times.minutes.default ||
    defaultRecoveryMinutes;

  return { averageMinutes, recoveryMinutes };
}

function findMatchupFormatAverageTimes({
  matchUpAverageTimes,
  matchUpFormat,
} = {}) {
  return matchUpAverageTimes?.find(
    ({ matchUpFormatCodes, averageTimes }) =>
      matchUpFormatCodes?.find((code) => matchUpFormat.startsWith(code)) &&
      averageTimes
  )?.averageTimes;
}

function findMatchupFormatRecoveryTimes({
  matchUpRecoveryTimes,
  averageMinutes,
  matchUpFormat,
} = {}) {
  return matchUpRecoveryTimes?.find(
    ({ matchUpFormatCodes, averageTimes, recoveryTimes }) => {
      if (averageTimes && averageMinutes) {
        const { greaterThan = 0, lessThan = 360 } = averageTimes;
        if (averageMinutes > greaterThan && averageMinutes < lessThan)
          return true;
      }
      const codeMatch =
        matchUpFormatCodes?.find((code) => matchUpFormat.startsWith(code)) &&
        recoveryTimes;
      return codeMatch;
    }
  )?.recoveryTimes;
}
