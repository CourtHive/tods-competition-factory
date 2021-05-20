import { findCategoryTiming } from './findCategoryTiming';
import { findMatchupFormatAverageTimes } from './findMatchUpFormatTimes';

export function getMatchUpFormatAverageTimes({
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

  const timesBlockArray = [
    eventAverageTimes,
    tournamentAverageTimes,
    policyAverageTimes,
    policy?.defaultTimes?.averageTimes,
    defaultTiming?.averageTimes,
  ];

  const averageTimes = findCategoryTiming({
    categoryName,
    categoryType,
    timesBlockArray,
  });

  return averageTimes;
}
