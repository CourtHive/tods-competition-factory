import { automatedPositioning } from '../governors/positionGovernor/automatedPositioning';
import { modifyDrawNotice } from '../notifications/drawNotifications';
import structureTemplate from './structureTemplate';
import { treeMatchUps } from './eliminationTree';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function generateVoluntaryConsolationStructure({
  structureName = VOLUNTARY_CONSOLATION,
  structureAbbreviation,
  drawDefinition,
  participants,
  matchUpType,
  structureId,
  automated,
  drawSize,
  event,
}) {
  const stage = VOLUNTARY_CONSOLATION;
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  matchUpType = matchUpType || drawDefinition.matchUpType;
  const { matchUps } = treeMatchUps({
    matchUpType,
    drawSize,
  });

  const structure = structureTemplate({
    stage,
    matchUps,
    matchUpType,
    structureName,
    structureAbbreviation,
    structureId,
  });

  drawDefinition.structures.push(structure);

  if (automated) {
    automatedPositioning({
      structureId: structureId || structure.structureId, // either passed in or generated in template
      drawDefinition,
      participants,
      event,
    });
  }

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS };
}
