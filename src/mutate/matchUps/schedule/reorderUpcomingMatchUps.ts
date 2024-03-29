import { addMatchUpScheduledTime } from '@Mutate/matchUps/schedule/scheduledTime';
import { decorateResult } from '@Functions/global/decorateResult';
import { findDrawDefinition } from '@Acquire/findDrawDefinition';

// constants
import { SUCCESS } from '@Constants/resultConstants';
import {
  DRAW_DEFINITION_NOT_FOUND,
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
  MODIFICATIONS_FAILED,
} from '@Constants/errorConditionConstants';

/**
 * Reorders an array of time-ordered matchUps by re-assigning their times
 * Assumes:
 * 1. that only the matchUps which need to be reordered are present in the matchUpContextIds array
 * 2. that either a match has moved from the bottom of the group to the top or vice-versa
 */
export function reorderUpcomingMatchUps(params) {
  const stack = 'reorderUpcomingMatchUps';
  const { tournamentRecords } = params;
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return decorateResult({
      result: { error: MISSING_TOURNAMENT_RECORDS },
      stack,
    });

  const { matchUpsContextIds, firstToLast } = params;
  if (!matchUpsContextIds) return decorateResult({ result: { error: MISSING_VALUE }, stack });

  const matchUpsCount = matchUpsContextIds?.length;
  if (!matchUpsCount) return { ...SUCCESS };

  let matchUpsModified = 0;
  matchUpsContextIds.forEach((context, index) => {
    const { tournamentId, drawId, matchUpId } = context;
    let calculatedIndex = index + (firstToLast ? -1 : 1);
    if (calculatedIndex < 0) calculatedIndex = matchUpsCount - 1;
    if (calculatedIndex === matchUpsCount) calculatedIndex = 0;
    const scheduledTime = matchUpsContextIds[calculatedIndex].schedule.scheduledTime;
    const result = assignMatchUpScheduledTime({
      tournamentId,
      scheduledTime,
      matchUpId,
      drawId,
    });
    if (result.success) {
      matchUpsModified++;
    } else {
      return result;
    }
  });

  return matchUpsModified === matchUpsCount
    ? SUCCESS
    : decorateResult({ result: { error: MODIFICATIONS_FAILED }, stack });

  function assignMatchUpScheduledTime({ tournamentId, scheduledTime, matchUpId, drawId }) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { drawDefinition } = findDrawDefinition({
      tournamentRecord,
      drawId,
    });
    if (!drawDefinition) return { error: DRAW_DEFINITION_NOT_FOUND };

    return addMatchUpScheduledTime({
      drawDefinition,
      scheduledTime,
      matchUpId,
    });
  }
}
