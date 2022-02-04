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
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  matchUpType = matchUpType || drawDefinition.matchUpType;
  const { matchUps } = treeMatchUps({
    matchUpType,
    drawSize,
  });

  const stage = VOLUNTARY_CONSOLATION;
  const structure = structureTemplate({
    structureAbbreviation,
    structureName,
    structureId,
    matchUpType,
    matchUps,
    stage,
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
