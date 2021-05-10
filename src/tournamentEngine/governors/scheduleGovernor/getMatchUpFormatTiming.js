import { findPolicy } from '../policyGovernor/findPolicy';
import {
  findEventExtension,
  findTournamentExtension,
} from '../queryGovernor/extensionQueries';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { POLICY_TYPE_SCHEDULING } from '../../../constants/policyConstants';
import { SCHEDULE_TIMING } from '../../../constants/extensionConstants';

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
  defaultRecoveryMinutes = 60,
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

  const averageTimes = getMatchUpAverageTimes(timingDetails);
  const averageKeys = Object.keys(averageTimes?.minutes || {});

  const averageMinutes =
    (averageKeys?.includes(eventType) && averageTimes.minutes[eventType]) ||
    averageTimes?.minutes?.default;

  const recoveryTimes = getMatchUpRecoveryTimes({
    ...timingDetails,
    averageMinutes,
  });

  const recoveryKeys = Object.keys(recoveryTimes?.minutes || {});
  const recoveryMinutes =
    (recoveryKeys?.includes(eventType) && recoveryTimes.minutes[eventType]) ||
    recoveryTimes.minutes.default;

  return { averageMinutes, recoveryMinutes };
}

function getMatchUpRecoveryTimes({
  matchUpFormat,
  categoryName,
  categoryType,

  averageMinutes,

  defaultTiming,
  tournamentScheduling,
  eventScheduling,
  policy,
}) {
  const eventRecoveryTimes =
    eventScheduling?.matchUpRecoveryTimes &&
    findMatchupFormatRecoveryTimes({
      ...eventScheduling,
      averageMinutes,
      matchUpFormat,
    });

  const tournamentRecoveryTimes =
    tournamentScheduling?.matchUpRecoveryTimes &&
    findMatchupFormatRecoveryTimes({
      ...tournamentScheduling,
      averageMinutes,
      matchUpFormat,
    });

  const policyRecoveryTimes =
    policy?.matchUpRecoveryTimes &&
    findMatchupFormatRecoveryTimes({
      ...policy,
      averageMinutes,
      matchUpFormat,
    });

  const recoveryTimes = [
    eventRecoveryTimes,
    tournamentRecoveryTimes,
    policyRecoveryTimes,
    policy?.defaultTimes?.recoveryTimes,
    defaultTiming?.recoveryTimes,
  ]
    .filter((f) => f)
    .map((recoveryTimes) =>
      recoveryTimes
        .sort(
          (a, b) =>
            (b.categoryNames?.length || 0) - (a.categoryNames?.length || 0)
        )
        .find(
          ({ categoryTypes, categoryNames }) =>
            (!categoryNames?.length && !categoryTypes?.length) ||
            categoryNames?.includes(categoryName) ||
            categoryTypes?.includes(categoryType)
        )
    )
    .find((f) => f);

  return recoveryTimes;
}

function getMatchUpAverageTimes({
  matchUpFormat,
  categoryName,
  categoryType,

  defaultTiming,
  tournamentScheduling,
  eventScheduling,
  policy,
}) {
  const eventAverageTimes =
    eventScheduling?.matchUpAverageTimes &&
    findMatchupFormatAverageTimes({
      ...eventScheduling,
      matchUpFormat,
    });

  const tournamentAverageTimes =
    tournamentScheduling?.matchUpAverageTimes &&
    findMatchupFormatAverageTimes({
      ...tournamentScheduling,
      matchUpFormat,
    });

  const policyAverageTimes =
    policy?.matchUpAverageTimes &&
    findMatchupFormatAverageTimes({
      ...policy,
      matchUpFormat,
    });

  const averageTimes = [
    eventAverageTimes,
    tournamentAverageTimes,
    policyAverageTimes,
    policy?.defaultTimes?.averageTimes,
    defaultTiming?.averageTimes,
  ]
    .filter((f) => f)
    .map((averageTimes) =>
      averageTimes
        .sort(
          (a, b) =>
            (b.categoryNames?.length || 0) - (a.categoryNames?.length || 0)
        )
        .find(
          ({ categoryTypes, categoryNames }) =>
            (!categoryNames?.length && !categoryTypes?.length) ||
            categoryNames?.includes(categoryName) ||
            categoryTypes?.includes(categoryType)
        )
    )
    .find((f) => f);

  return averageTimes;
}

function findMatchupFormatAverageTimes({
  matchUpAverageTimes,
  matchUpFormat,
} = {}) {
  // first find all matchUpAverageTime definitions which include matchUpFormats...
  // ... that either exactly match or start with the target matchUpFormat.
  const codeMatches =
    matchUpAverageTimes
      ?.map(({ matchUpFormatCodes }) => {
        const matching = matchUpFormatCodes?.filter((code) =>
          code.startsWith(matchUpFormat)
        );
        return matching;
      })
      .flat()
      .filter((f) => f)
      // sort by length; shortest first; prioritize first match
      .sort((a, b) => (a?.length || 0) - (b?.length || 0)) || [];

  // determine if there is an exact match
  const exactCodeMatch = codeMatches.includes(matchUpFormat);
  // select the exact match or the shortest code which matches
  const targetCode = exactCodeMatch ? matchUpFormat : codeMatches[0];
  const targetDefinition = matchUpAverageTimes?.find(
    ({ matchUpFormatCodes, averageTimes }) =>
      matchUpFormatCodes?.find((code) => targetCode === code) && averageTimes
  );
  return targetDefinition?.averageTimes;
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
        matchUpFormatCodes?.find((code) => code.startsWith(matchUpFormat)) &&
        recoveryTimes;
      return codeMatch;
    }
  )?.recoveryTimes;
}
