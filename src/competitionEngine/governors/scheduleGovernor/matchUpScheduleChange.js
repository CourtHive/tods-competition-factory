import { assignMatchUpCourt as assignCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
  NO_MODIFICATIONS_APPLIED,
} from '../../../constants/errorConditionConstants';

export function matchUpScheduleChange(params) {
  const { tournamentRecords } = params;
  if (
    typeof tournamentRecords !== 'object' ||
    !Object.keys(tournamentRecords).length
  )
    return { error: MISSING_TOURNAMENT_RECORDS };

  const {
    sourceMatchUpContextIds,
    targetMatchUpContextIds,
    sourceCourtId,
    targetCourtId,
    courtDayDate,
  } = params || {};

  const {
    drawId: sourceDrawId,
    matchUpId: sourceMatchUpId,
    tournamentId: sourceTournamentId,
  } = sourceMatchUpContextIds || {};

  const {
    drawId: targetDrawId,
    matchUpId: targetMatchUpId,
    tournamentId: targetTournamentId,
  } = targetMatchUpContextIds || {};

  if (!sourceMatchUpId && !targetMatchUpId) return { error: MISSING_VALUE };

  let matchUpsModified = 0;

  if (targetCourtId && sourceMatchUpId && !targetMatchUpId) {
    const result = assignMatchUpCourt({
      tournamentId: sourceTournamentId,
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId,
      drawId: sourceDrawId,
      courtDayDate,
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
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId,
      drawId: sourceDrawId,
      courtDayDate,
    });
    if (sourceResult.success) matchUpsModified++;
    if (sourceResult.error) return sourceResult;

    const targetResult = assignMatchUpCourt({
      tournamentId: targetTournamentId,
      matchUpId: targetMatchUpId,
      courtId: sourceCourtId,
      drawId: targetDrawId,
      courtDayDate,
    });
    if (targetResult.success) matchUpsModified++;
    if (targetResult.error) return targetResult;
  } else {
    // no modification
    // console.log('matcUpScheduleChange', params);
  }

  return matchUpsModified ? SUCCESS : { error: NO_MODIFICATIONS_APPLIED };

  function assignMatchUpCourt({
    tournamentId,
    courtDayDate,
    matchUpId,
    courtId,
    drawId,
  }) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { drawDefinition } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });

    return assignCourt({
      tournamentRecord,
      drawDefinition,
      courtDayDate,
      matchUpId,
      courtId,
    });
  }
}
