import { getDrawDefinition } from '../../../tournamentEngine/getters/eventGetter';

import { SUCCESS } from '../../../constants/resultConstants';

export function matchUpScheduleChange(params) {
  const { drawEngine, tournamentRecords, deepCopy } = params;
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
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId,
    });
    if (result?.success) matchUpsModified++;
  } else if (
    sourceCourtId &&
    targetCourtId &&
    sourceMatchUpId &&
    targetMatchUpId
  ) {
    const sourceResult = assignMatchUpCourt({
      tournamentId: sourceTournamentId,
      drawId: sourceDrawId,
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId,
      deepCopy,
    });
    if (sourceResult.success) matchUpsModified++;

    const targetResult = assignMatchUpCourt({
      tournamentId: targetTournamentId,
      drawId: targetDrawId,
      matchUpId: targetMatchUpId,
      courtId: sourceCourtId,
      deepCopy,
    });
    if (targetResult.success) matchUpsModified++;
  } else {
    console.log('matcUpScheduleChange', params);
  }

  return matchUpsModified ? SUCCESS : undefined;

  function assignMatchUpCourt({
    tournamentId,
    drawId,
    matchUpId,
    courtId,
    deepCopy,
  }) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { drawDefinition, event } = getDrawDefinition({
      tournamentRecord,
      drawId,
    });
    const result = drawEngine
      .setState(drawDefinition, deepCopy)
      .assignMatchUpCourt({
        matchUpId: matchUpId,
        courtId: courtId,
        courtDayDate,
        deepCopy,
      });

    if (result?.success) {
      const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
      event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
        return drawDefinition.drawId === drawId
          ? updatedDrawDefinition
          : drawDefinition;
      });

      return SUCCESS;
    }
  }
}
