import { getModifiedMatchUpFormatTiming } from './getModifiedMatchUpTiming';
import { modifyMatchUpFormatTiming } from './modifyMatchUpFormatTiming';
import { matchUpFormatCode } from 'tods-matchup-format-code';

import { DOUBLES } from '../../../../constants/eventConstants';
import { SINGLES } from '../../../../constants/matchUpTypes';
import {
  INVALID_VALUES,
  MISSING_EVENT,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function modifyEventMatchUpFormatTiming({
  tournamentRecord,
  event,

  categoryType,
  matchUpFormat,
  averageMinutes,
  recoveryMinutes,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!matchUpFormatCode.isValidMatchUpFormat(matchUpFormat))
    return { error: INVALID_VALUES };
  if (!event) return { error: MISSING_EVENT };

  const { averageTimes = [], recoveryTimes = [] } =
    getModifiedMatchUpFormatTiming({
      tournamentRecord,
      matchUpFormat,
      event,
    });

  const category = event.category;
  const categoryName = category?.categoryName || category?.ageCategoryCode;
  const isDoubles = event.eventType === 'DOUBLES';

  let currentAverageTime = { categoryNames: [categoryName], minutes: {} };
  let currentRecoveryTime = { categoryNames: [categoryName], minutes: {} };

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

  const validAverageMinutes = !isNaN(parseInt(averageMinutes));
  const validRecoveryMinutes = !isNaN(parseInt(recoveryMinutes));

  const newAverageTimes = averageTimes
    .map(newTiming)
    .filter((f) => f?.categoryNames?.length);
  const newRecoveryTimes = recoveryTimes
    .map(newTiming)
    .filter((f) => f?.categoryNames?.length);

  if (validAverageMinutes) {
    Object.assign(currentAverageTime.minutes, {
      [isDoubles ? DOUBLES : SINGLES]: averageMinutes,
    });
    newAverageTimes.push(currentAverageTime);
  }

  if (validRecoveryMinutes) {
    Object.assign(currentRecoveryTime.minutes, {
      [isDoubles ? DOUBLES : SINGLES]: recoveryMinutes,
    });
    newRecoveryTimes.push(currentRecoveryTime);
  }

  if (!validAverageMinutes && !validRecoveryMinutes)
    return { error: INVALID_VALUES };

  return modifyMatchUpFormatTiming({
    tournamentRecord,
    event,
    matchUpFormat,
    averageTimes: validAverageMinutes && newAverageTimes,
    recoveryTimes: validRecoveryMinutes && newRecoveryTimes,
  });
}
