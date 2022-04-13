import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';

import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';
import { COMPLETED } from '../../../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';

export function updateTieFormat({
  tournamentRecord,
  drawDefinition,
  structure,
  tieFormat,
  eventId,
  matchUp,
  event,
}) {
  if (event && eventId) {
    event.tieFormat = tieFormat;
  } else if (matchUp) {
    matchUp.tieFormat = tieFormat;
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
    });
  } else if (structure) {
    updateStructureMatchUps({
      tournamentRecord,
      drawDefinition,
      structure,
      tieFormat,
    });
    modifyDrawNotice({ drawDefinition, structureIds: [structure.structureId] });
  } else if (drawDefinition) {
    drawDefinition.tieFormat = tieFormat;
    const modifiedStructureIds = [];

    for (const structure of drawDefinition.structures || []) {
      updateStructureMatchUps({
        tournamentRecord,
        drawDefinition,
        structure,
        tieFormat,
      });
      modifiedStructureIds.push(structure.structureId);
    }
    modifyDrawNotice({ drawDefinition, structureIds: modifiedStructureIds });
  } else {
    return { error: MISSING_DRAW_DEFINITION };
  }

  return { ...SUCCESS };
}

function updateStructureMatchUps({
  tournamentRecord,
  drawDefinition,
  structure,
  tieFormat,
}) {
  const matchUps = getAllStructureMatchUps({
    matchUpFilters: { matchUpTypes: [TEAM] },
    structure,
  })?.matchUps;
  // all team matchUps in the structure which do not have tieFormats should have matchUps added

  const targetMatchUps = matchUps.filter(
    (matchUp) => matchUp.matchUpStatus !== COMPLETED
  );
  for (const matchUp of targetMatchUps) {
    // don't update matchUps which are already COMPLETED
    matchUp.tieFormat = tieFormat;
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
    });
  }
}
