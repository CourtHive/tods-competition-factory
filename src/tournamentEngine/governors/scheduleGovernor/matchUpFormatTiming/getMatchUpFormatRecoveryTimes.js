import { findCategoryTiming } from './findCategoryTiming';
import { findMatchupFormatRecoveryTimes } from './findMatchUpFormatTimes';

export function getMatchUpFormatRecoveryTimes({
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

  const timesBlockArray = [
    eventRecoveryTimes,
    tournamentRecoveryTimes,
    policyRecoveryTimes,
    policy?.defaultTimes?.recoveryTimes,
    defaultTiming?.recoveryTimes,
  ];

  const recoveryTimes = findCategoryTiming({
    categoryName,
    categoryType,
    timesBlockArray,
  });

  return recoveryTimes;
}
