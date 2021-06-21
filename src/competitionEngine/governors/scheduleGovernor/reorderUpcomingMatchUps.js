import { addMatchUpScheduledTime } from '../../../drawEngine/governors/matchUpGovernor/scheduleItems';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

import {
  MISSING_TOURNAMENT_RECORDS,
  MODIFICATIONS_FAILED,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function reorderUpcomingMatchUps(params) {
  const { tournamentRecords } = params;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const { matchUpsContextIds, firstToLast } = params;
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
