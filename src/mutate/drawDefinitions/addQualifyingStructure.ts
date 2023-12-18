import { generateQualifyingStructure } from '../../assemblies/generators/drawDefinitions/generateQualifyingStructure';
import { attachQualifyingStructure } from './attachQualifyingStructure';

import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../constants/errorConditionConstants';

export function addQualifyingStructure(params) {
  if (!params.drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!params.targetStructureId) return { error: MISSING_STRUCTURE_ID };
  const result = generateQualifyingStructure(params);
  if (result.error) return result;
  const { structure, link } = result;
  if (!structure || !link) return { error: INVALID_VALUES };

  return attachQualifyingStructure({
    tournamentId: params.tournamentRecord?.tournamentId,
    eventId: params.event?.eventId || params.eventId,
    drawDefinition: params.drawDefinition,
    structure,
    link,
  });
}
