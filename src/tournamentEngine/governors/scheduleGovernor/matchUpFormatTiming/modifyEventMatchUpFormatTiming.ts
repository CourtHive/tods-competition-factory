import { isValid } from '../../../../matchUpEngine/governors/matchUpFormatGovernor/isValid';
import { getModifiedMatchUpFormatTiming } from './getModifiedMatchUpTiming';
import { modifyMatchUpFormatTiming } from './modifyMatchUpFormatTiming';
import { ensureInt } from '../../../../utilities/ensureInt';

import { SINGLES } from '../../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function modifyEventMatchUpFormatTiming({
  tournamentRecord,
  recoveryMinutes,
  averageMinutes,
  matchUpFormat,
  categoryType,
  event,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isValid(matchUpFormat)) return { error: INVALID_VALUES };
  if (!event) return { error: MISSING_EVENT };

  const { averageTimes = [], recoveryTimes = [] } =
    getModifiedMatchUpFormatTiming({
      tournamentRecord,
      matchUpFormat,
      event,
    });

  const category = event.category;
  const categoryName =
    category?.categoryName || category?.ageCategoryCode || event?.eventId;

  let currentAverageTime = { categoryNames: [categoryName], minutes: {} };
  const currentRecoveryTime = { categoryNames: [categoryName], minutes: {} };

  const newTiming = (timing) => {
    if (timing.categoryTypes?.includes(categoryType)) {
      // TODO
      console.log('encountered:', { categoryType });
    }
    if (timing.categoryNames?.includes(categoryName)) {
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

  const validAverageMinutes = !isNaN(ensureInt(averageMinutes));
  const validRecoveryMinutes = !isNaN(ensureInt(recoveryMinutes));

  const newAverageTimes = averageTimes
    .map(newTiming)
    .filter((f) => f?.categoryNames?.length);
  const newRecoveryTimes = recoveryTimes
    .map(newTiming)
    .filter((f) => f?.categoryNames?.length);

  if (validAverageMinutes) {
    Object.assign(currentAverageTime.minutes, {
      [event?.eventType || SINGLES]: averageMinutes,
    });
    newAverageTimes.push(currentAverageTime);
  }

  if (validRecoveryMinutes) {
    Object.assign(currentRecoveryTime.minutes, {
      [event?.eventType || SINGLES]: recoveryMinutes,
    });
    newRecoveryTimes.push(currentRecoveryTime);
  }

  if (!validAverageMinutes && !validRecoveryMinutes)
    return { error: INVALID_VALUES };

  return modifyMatchUpFormatTiming({
    averageTimes: validAverageMinutes && newAverageTimes,
    recoveryTimes: validRecoveryMinutes && newRecoveryTimes,
    tournamentRecord,
    matchUpFormat,
    event,
  });
}
