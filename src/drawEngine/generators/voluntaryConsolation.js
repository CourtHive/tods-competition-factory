import { automatedPositioning } from '../governors/positionGovernor/automatedPositioning';
import { getStageDrawPositionsCount } from '../getters/stageGetter';
import structureTemplate from './structureTemplate';
import { treeMatchUps } from './eliminationTree';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function generateVoluntaryConsolationStructure({
  drawDefinition,
  participants,
  event,

  structureName = VOLUNTARY_CONSOLATION,
  structureAbbreviation,
  structureId,
  automated,
}) {
  const stage = VOLUNTARY_CONSOLATION;
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const drawSize = getStageDrawPositionsCount({ stage, drawDefinition });
  const { matchUps } = treeMatchUps({ drawSize });

  const structure = structureTemplate({
    stage,
    matchUps,
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

  return SUCCESS;
}
