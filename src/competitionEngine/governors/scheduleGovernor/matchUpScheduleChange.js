import { getDrawDefinition } from "../../../tournamentEngine/getters/eventGetter";

import { SUCCESS } from "../../../constants/resultConstants";

export function matchUpScheduleChange(params) {
  const { drawEngine, tournamentRecords } = params;
  const {
    sourceMatchUpContextIds,
    targetMatchUpContextIds,
    sourceCourtId,
    targetCourtId,
    courtDayDate
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
      courtId: targetCourtId
    });
    if (result.success) matchUpsModified++;
  } else if (sourceCourtId && targetCourtId && sourceMatchUpId && targetMatchUpId) {
    const sourceResult = assignMatchUpCourt({
      tournamentId: sourceTournamentId,
      drawId: sourceDrawId,
      matchUpId: sourceMatchUpId,
      courtId: targetCourtId
    });
    if (sourceResult.success) matchUpsModified++;

    const targetResult = assignMatchUpCourt({
      tournamentId: targetTournamentId,
      drawId: targetDrawId,
      matchUpId: targetMatchUpId,
      courtId: sourceCourtId
    });
    if (targetResult.success) matchUpsModified++;
  } else {
    console.log('matcUpScheduleChange', params);
  }

  return matchUpsModified ? SUCCESS : undefined;
  
  function assignMatchUpCourt({tournamentId, drawId, matchUpId, courtId}) {
    const tournamentRecord = tournamentRecords[tournamentId];
    const { drawDefinition, event } = getDrawDefinition({tournamentRecord, drawId});
    const result = drawEngine
      .setState(drawDefinition)
      .assignMatchUpCourt({
        matchUpId: matchUpId,
        courtId: courtId,
        courtDayDate
      });

    if (result.success) {
      const updatedDrawDefinition = drawEngine.getState();
      event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
        return drawDefinition.drawId === drawId ? updatedDrawDefinition : drawDefinition;   
      });

      return SUCCESS;
    }
  }
}

