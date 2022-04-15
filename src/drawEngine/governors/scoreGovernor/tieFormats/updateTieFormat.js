import { getAllStructureMatchUps } from '../../../getters/getMatchUps/getAllStructureMatchUps';
import { makeDeepCopy } from '../../../../utilities';
import { validUpdate } from './validUpdate';
import {
  modifyDrawNotice,
  modifyMatchUpNotice,
} from '../../../notifications/drawNotifications';

import { MISSING_DRAW_DEFINITION } from '../../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';
import { TEAM } from '../../../../constants/matchUpTypes';

function copyTieFormat(tieFormat) {
  return makeDeepCopy(tieFormat, false, true);
}

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
    structure.tieFormat = tieFormat;
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

  // all team matchUps in the structure which are not completed and which have no score value should have matchUps added
  const targetMatchUps = matchUps.filter(
    (matchUp) => validUpdate({ matchUp }) && matchUp.tieFormat
  );

  for (const matchUp of targetMatchUps) {
    matchUp.tieFormat = copyTieFormat(tieFormat);
    modifyMatchUpNotice({
      tournamentId: tournamentRecord?.tournamentId,
      drawDefinition,
      matchUp,
    });
  }
}
