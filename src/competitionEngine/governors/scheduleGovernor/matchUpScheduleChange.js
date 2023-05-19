import { assignMatchUpCourt as assignCourt } from '../../../tournamentEngine/governors/scheduleGovernor/assignMatchUpCourt';
import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';
import { decorateResult } from '../../../global/functions/decorateResult';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORDS,
  MISSING_VALUE,
  NO_MODIFICATIONS_APPLIED,
} from '../../../constants/errorConditionConstants';

export function matchUpScheduleChange(params) {
  const stack = 'matchUpScheduleChange';
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

  if (!sourceMatchUpId && !targetMatchUpId)
    return decorateResult({ result: { error: MISSING_VALUE }, stack });

  let matchUpsModified = 0;

  if (targetCourtId && sourceMatchUpId && !targetMatchUpId) {
    const result = assignMatchUpCourt({
      tournamentId: sourceTournamentId,
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId,
      drawId: sourceDrawId,
      tournamentRecords,
      courtDayDate,
    });
    if (result?.success) matchUpsModified++;
    if (result.error) return decorateResult({ result, stack });
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
      tournamentRecords,
      courtDayDate,
    });
    if (sourceResult.success) matchUpsModified++;
    if (sourceResult.error)
      return decorateResult({ result: sourceResult, stack, info: 'source' });

    const targetResult = assignMatchUpCourt({
      tournamentId: targetTournamentId,
      matchUpId: targetMatchUpId,
      courtId: sourceCourtId,
      drawId: targetDrawId,
      tournamentRecords,
      courtDayDate,
    });
    if (targetResult.success) matchUpsModified++;
    if (targetResult.error)
      return decorateResult({ result: targetResult, stack, info: 'target' });
  } else {
    // no modification
    // console.log('matcUpScheduleChange', params);
  }

  return matchUpsModified
    ? SUCCESS
    : decorateResult({ result: { error: NO_MODIFICATIONS_APPLIED }, stack });

  function assignMatchUpCourt({
    tournamentRecords,
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
      tournamentRecords,
      tournamentRecord,
      drawDefinition,
      courtDayDate,
      matchUpId,
      courtId,
    });
  }
}
