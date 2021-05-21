import { isValidMatchUpFormat } from '../../../../drawEngine/governors/matchUpGovernor/isValidMatchUpFormat';
import { getModifiedMatchUpFormatTiming } from './getModifiedMatchUpTiming';
import { modifyMatchUpFormatTiming } from './modifyMatchUpFormatTiming';

import {
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';
import { DOUBLES } from '../../../../constants/eventConstants';
import { SINGLES } from '../../../../constants/matchUpTypes';

export function modifyEventMatchUpFormatTiming({
  tournamentRecord,
  event,

  matchUpFormat,
  averageMinutes,
  recoveryMinutes,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isValidMatchUpFormat(matchUpFormat)) return { error: INVALID_VALUES };
  if (!event) return { error: MISSING_EVENT };

  const { averageTimes = [], recoveryTimes = [] } =
    getModifiedMatchUpFormatTiming({
      tournamentRecord,
      matchUpFormat,
      event,
    });

  const category = event.category;
  const categoryName = category?.categoryName || category?.ageCategory;
  const isDoubles = event.eventType === 'DOUBLES';

  let currentAverageTime = { categoryNames: [categoryName], minutes: {} };
  let currentRecoveryTime = { categoryNames: [categoryName], minutes: {} };

  const newTiming = (timing) => {
    if (timing.categoryNames.includes(categoryName)) {
      timing.categoryNames = timing.categoryNames.filter(
        (c) => c !== categoryName
      );
      currentAverageTime = {
        minutes: timing.minutes,
        categoryNames: [categoryName],
      };
      if (!timing.categoryNames.length) return;
    }
    return timing;
  };

  const newAverageTimes = averageTimes.map(newTiming).filter((f) => f);
  const newRecoveryTimes = recoveryTimes.map(newTiming).filter((f) => f);

  if (averageMinutes) {
    Object.assign(currentAverageTime.minutes, {
      [isDoubles ? DOUBLES : SINGLES]: averageMinutes,
    });
  }

  if (recoveryMinutes) {
    Object.assign(currentRecoveryTime.minutes, {
      [isDoubles ? DOUBLES : SINGLES]: recoveryMinutes,
    });
  }

  newAverageTimes.push(currentAverageTime);
  newRecoveryTimes.push(currentRecoveryTime);

  return modifyMatchUpFormatTiming({
    tournamentRecord,
    event,
    matchUpFormat,
    averageTimes: averageMinutes && newAverageTimes,
    recoveryTimes: recoveryMinutes && newRecoveryTimes,
  });
}
