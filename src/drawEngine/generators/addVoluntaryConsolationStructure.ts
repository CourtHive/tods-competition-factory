import { modifyDrawNotice } from '../notifications/drawNotifications';
import { constantToString } from '../../utilities/strings';
import structureTemplate from './structureTemplate';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { VOLUNTARY_CONSOLATION } from '../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../constants/resultConstants';

export function addVoluntaryConsolationStructure({
  structureName = constantToString(VOLUNTARY_CONSOLATION),
  structureAbbreviation,
  drawDefinition,
  matchUpType,
  structureId,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const structure = structureTemplate({
    stage: VOLUNTARY_CONSOLATION,
    structureAbbreviation,
    structureName,
    matchUps: [],
    structureId,
    matchUpType,
  });

  drawDefinition.structures.push(structure);

  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS };
}
