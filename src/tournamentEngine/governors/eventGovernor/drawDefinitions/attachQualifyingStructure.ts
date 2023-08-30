import { attachQualifyingStructure as attachQualifying } from '../../../../drawEngine/governors/structureGovernor/attachQualifyingStructure';
import { addTournamentTimeItem } from '../../tournamentGovernor/addTimeItem';

import {
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function attachQualifyingStructure({
  tournamentRecord,
  drawDefinition,
  structure,
  link,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const result = attachQualifying({
    tournamentId: tournamentRecord.tournamentId,
    drawDefinition,
    structure,
    link,
  });
  if (result.error) return result;

  const qualifyingDetails = {
    structureId: structure.structureId,
    drawId: drawDefinition.drawId,
  };

  const timeItem = {
    itemType: 'attachQualifyingStructures',
    itemValue: qualifyingDetails,
  };
  addTournamentTimeItem({ tournamentRecord, timeItem });

  return result;
}
