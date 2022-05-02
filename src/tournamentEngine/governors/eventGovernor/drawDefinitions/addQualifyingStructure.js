import { addQualifyingStructure as addQualifying } from '../../../../drawEngine/governors/structureGovernor/addQualifyingStructure';
import { addTournamentTimeItem } from '../../tournamentGovernor/addTimeItem';
import { definedAttributes } from '../../../../utilities/objects';

import { MISSING_TOURNAMENT_RECORD } from '../../../../constants/errorConditionConstants';

export function addQualifyingStructure(params) {
  const tournamentRecord = params.tournamentRecord;
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };

  const result = addQualifying(params);
  if (result.error) return result;

  const {
    qualifyingRoundNumber,
    qualifyingPositions,
    targetStructureId,
    drawDefinition,
    structureName,
    matchUpType,
    drawSize,
    drawType,
  } = params;

  const qualifyingDetails = definedAttributes({
    drawId: drawDefinition.drawId,
    structureName,
    targetStructureId,
    qualifyingPositions,
    qualifyingRoundNumber,
    matchUpType,
    drawSize,
    drawType,
  });

  const timeItem = {
    itemType: 'addQualifyingStructures',
    itemValue: qualifyingDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
