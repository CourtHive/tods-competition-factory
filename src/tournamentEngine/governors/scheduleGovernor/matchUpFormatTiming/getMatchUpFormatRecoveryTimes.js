import { findMatchupFormatRecoveryTimes } from './findMatchUpFormatTimes';
import { findCategoryTiming } from './findCategoryTiming';

export function getMatchUpFormatRecoveryTimes({
  tournamentScheduling,
  eventScheduling,
  averageMinutes,
  defaultTiming,
  matchUpFormat,
  categoryName,
  categoryType,
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

  return findCategoryTiming({
    categoryName,
    categoryType,
    timesBlockArray,
  });
}
