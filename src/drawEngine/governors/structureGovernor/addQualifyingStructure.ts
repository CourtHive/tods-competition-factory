import { generateQualifyingStructure } from './generateQualifyingStructure';
import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import { attachQualifyingStructure } from './attachQualifyingStructure';

export function addQualifyingStructure(params) {
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
