import { getModifiedMatchUpFormatTiming } from '@Query/extensions/matchUpFormatTiming/getModifiedMatchUpTiming';
import { modifyMatchUpFormatTiming } from '../matchUps/modifyMatchUpFormatTiming';
import { isValidMatchUpFormat } from '@Validators/isValidMatchUpFormat';
import { Event, Tournament } from '@Types/tournamentTypes';
import { ensureInt } from '@Tools/ensureInt';

import { INVALID_VALUES, MISSING_EVENT, MISSING_TOURNAMENT_RECORD } from '@Constants/errorConditionConstants';
import { SINGLES } from '@Constants/matchUpTypes';

type ModifyEventMatchUpFormatTimingArgs = {
  tournamentRecord: Tournament;
  recoveryMinutes?: number;
  averageMinutes?: number;
  matchUpFormat: string;
  categoryType?: string;
  tournamentId?: string;
  eventId: string;
  event?: Event;
};

export function modifyEventMatchUpFormatTiming(params: ModifyEventMatchUpFormatTimingArgs) {
  const { tournamentRecord, recoveryMinutes, averageMinutes, matchUpFormat, categoryType, eventId, event } = params;

  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!isValidMatchUpFormat({ matchUpFormat })) return { error: INVALID_VALUES };
  if (!event) return { error: MISSING_EVENT };

  const { averageTimes = [], recoveryTimes = [] } = getModifiedMatchUpFormatTiming({
    tournamentRecord,
    matchUpFormat,
    event,
  });

  const category = event.category;
  const categoryName = category?.categoryName || category?.ageCategoryCode || event?.eventId;

  let currentAverageTime = { categoryNames: [categoryName], minutes: {} };
  const currentRecoveryTime = { categoryNames: [categoryName], minutes: {} };

  const newTiming = (timing) => {
    if (timing.categoryTypes?.includes(categoryType)) {
      console.log('encountered:', { categoryType });
    }
    if (timing.categoryNames?.includes(categoryName)) {
      timing.categoryNames = timing.categoryNames.filter((c) => c !== categoryName);
      currentAverageTime = {
        minutes: timing.minutes,
        categoryNames: [categoryName],
      };
      if (!timing.categoryNames.length) return;
    }
    return timing;
  };

  const validAverageMinutes = averageMinutes && !isNaN(ensureInt(averageMinutes));
  const validRecoveryMinutes = recoveryMinutes && !isNaN(ensureInt(recoveryMinutes));

  const newAverageTimes = averageTimes.map(newTiming).filter((f) => f?.categoryNames?.length);
  const newRecoveryTimes = recoveryTimes.map(newTiming).filter((f) => f?.categoryNames?.length);

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

  if (!validAverageMinutes && !validRecoveryMinutes) return { error: INVALID_VALUES };

  return modifyMatchUpFormatTiming({
    averageTimes: validAverageMinutes && newAverageTimes,
    recoveryTimes: validRecoveryMinutes && newRecoveryTimes,
    tournamentRecord,
    matchUpFormat,
    eventId,
    event,
  });
}
