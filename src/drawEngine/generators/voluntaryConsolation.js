import { automatedPositioning } from '../governors/positionGovernor/automatedPositioning';
import { modifyDrawNotice } from '../notifications/drawNotifications';
import { getStageDrawPositionsCount } from '../getters/stageGetter';
import structureTemplate from './structureTemplate';
import { treeMatchUps } from './eliminationTree';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function generateVoluntaryConsolationStructure({
  drawDefinition,
  participants,
  matchUpType,
  event,

  structureName = VOLUNTARY_CONSOLATION,
  structureAbbreviation,
  structureId,
  automated,
}) {
  const stage = VOLUNTARY_CONSOLATION;
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  matchUpType = matchUpType || drawDefinition.matchUpType;
  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
  const { matchUps } = treeMatchUps({ drawSize, matchUpType });

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
      drawDefinition,
      participants,
      event,
      structureId: structureId || structure.structureId, // either passed in or generated in template
    });
  }

  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
