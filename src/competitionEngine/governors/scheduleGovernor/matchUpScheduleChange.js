import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { assignMatchUpCourt as assignCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';

import { SUCCESS } from '../../../constants/resultConstants';

export function matchUpScheduleChange(params) {
  const { tournamentRecords } = params;
  const {
    sourceMatchUpContextIds,
    targetMatchUpContextIds,
    sourceCourtId,
    targetCourtId,
    courtDayDate,
  } = params;

  const {
    drawId: sourceDrawId,
    matchUpId: sourceMatchUpId,
    tournamentId: sourceTournamentId,
  } = sourceMatchUpContextIds;

  const {
    drawId: targetDrawId,
    matchUpId: targetMatchUpId,
    tournamentId: targetTournamentId,
  } = targetMatchUpContextIds;

  let matchUpsModified = 0;

  if (targetCourtId && sourceMatchUpId && !targetMatchUpId) {
    const result = assignMatchUpCourt({
      tournamentId: sourceTournamentId,
      drawId: sourceDrawId,
      courtDayDate,
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId,
    });
    if (result?.success) matchUpsModified++;
    if (result.error) return result;
  } else if (
    sourceCourtId &&
    targetCourtId &&
    sourceMatchUpId &&
    targetMatchUpId
  ) {
    const sourceResult = assignMatchUpCourt({
      tournamentId: sourceTournamentId,
      drawId: sourceDrawId,
      courtDayDate,
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId,
    });
    if (sourceResult.success) matchUpsModified++;
    if (sourceResult.error) return sourceResult;

    const targetResult = assignMatchUpCourt({
      tournamentId: targetTournamentId,
      drawId: targetDrawId,
      courtDayDate,
      matchUpId: targetMatchUpId,
      courtId: sourceCourtId,
    });
    if (targetResult.success) matchUpsModified++;
    if (targetResult.error) return targetResult;
  } else {
    console.log('matcUpScheduleChange', params);
  }

  return matchUpsModified ? SUCCESS : undefined;

  function assignMatchUpCourt({
    tournamentId,
    drawId,
    matchUpId,
    courtDayDate,
    courtId,
  }) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { drawDefinition } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });

    return assignCourt({
      tournamentRecord,
      drawDefinition,
      matchUpId,
      courtId,
      courtDayDate,
    });
  }
}
