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

  const { averageTimes, recoveryTimes } = getModifiedMatchUpFormatTiming({
    tournamentRecord,
    matchUpFormat,
    event,
  });

  const category = event.category;
  const categoryName = category.categoryName || category.ageCategory;
  const isDoubles = event.eventType === 'DOUBLES';

  let currentAverageTime = { categoryNames: [categoryName], minutes: {} };
  let currentRecoveryTime = { categoryNames: [categoryName], minutes: {} };

  const newAverageTimes = (averageTimes || [])
    .map((at) => {
      if (at.categoryNames.includes(categoryName)) {
        at.categoryNames = at.categoryNames.filter((c) => c !== categoryName);
        currentAverageTime = {
          minutes: at.minutes,
          categoryNames: [categoryName],
        };
        if (!at.categoryNames.length) return;
      }
      return at;
    })
    .filter((f) => f);

  const newRecoveryTimes = (recoveryTimes || [])
    .map((at) => {
      if (at.categoryNames.includes(categoryName)) {
        at.categoryNames = at.categoryNames.filter((c) => c !== categoryName);
        currentRecoveryTime = {
          minutes: at.minutes,
          categoryNames: [categoryName],
        };
        if (!at.categoryNames.length) return;
      }
      return at;
    })
    .filter((f) => f);

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
    averageTimes: newAverageTimes,
    recoveryTimes: newRecoveryTimes,
  });
}
