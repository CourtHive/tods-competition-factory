import { addMatchUpScheduledTime } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
  MODIFICATIONS_FAILED,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/**
 * Reorders an array of time-ordered matchUps by re-assigning their times
 * Assumes:
 * 1. that only the matchUps which need to be reordered are present in the matchUpContextIds array
 * 2. that either a match has moved from the bottom of the group to the top or vice-versa
 *
 * @param {object[]} tournamentRecords
 * @param {object[]} matchUpsContextIds - [{ tournamentId, drawId, matchUpId, schedule }] - derived from inContext matchUps
 * @param {boolean} firstToLast - boolean whether first is moved to last or last to first (default)
 *
 * @returns { success: true } or { error }
 */
export function reorderUpcomingMatchUps(params) {
  const { tournamentRecords } = params;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const { matchUpsContextIds, firstToLast } = params;
  if (!matchUpsContextIds) return { error: MISSING_VALUE };

  const matchUpsCount = matchUpsContextIds?.length;
  if (!matchUpsCount) return SUCCESS;

  let matchUpsModified = 0;
  matchUpsContextIds.forEach((context, index) => {
    const { tournamentId, drawId, matchUpId } = context;
    let calculatedIndex = index + (firstToLast ? -1 : 1);
    if (calculatedIndex < 0) calculatedIndex = matchUpsCount - 1;
    if (calculatedIndex === matchUpsCount) calculatedIndex = 0;
    const scheduledTime =
      matchUpsContextIds[calculatedIndex].schedule.scheduledTime;
    const result = assignMatchUpScheduledTime({
      tournamentId,
      drawId,
      matchUpId,
      scheduledTime,
    });
    if (result.success) {
      matchUpsModified++;
    } else {
      return result;
    }
  });

  return matchUpsModified === matchUpsCount
    ? SUCCESS
    : { error: MODIFICATIONS_FAILED };

  function assignMatchUpScheduledTime({
    tournamentId,
    drawId,
    matchUpId,
    scheduledTime,
  }) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { drawDefinition } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });

    return addMatchUpScheduledTime({
      drawDefinition,
      matchUpId,
      scheduledTime,
    });
  }
}
