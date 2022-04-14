import { modifyDrawNotice } from '../notifications/drawNotifications';
import structureTemplate from './structureTemplate';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function addVoluntaryConsolationStructure({
  structureName = VOLUNTARY_CONSOLATION,
  structureAbbreviation,
  drawDefinition,
  matchUpType,
  structureId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  /*
  matchUpType = matchUpType || drawDefinition.matchUpType;
  const { matchUps } = treeMatchUps({
    matchUpType,
    drawSize,
  });
  */

  const structure = structureTemplate({
    stage: VOLUNTARY_CONSOLATION,
    structureAbbreviation,
    structureName,
    matchUps: [],
    structureId,
    matchUpType,
  });

  drawDefinition.structures.push(structure);

  /*
  if (automated) {
    automatedPositioning({
      structureId: structureId || structure.structureId, // either passed in or generated in template
      tournamentRecord,
      drawDefinition,
      participants,
      event,
    });
  }
  */

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS };
}
