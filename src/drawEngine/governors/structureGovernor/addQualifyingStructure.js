import { generateQualifyingStructure } from './generateQualifyingStructure';
import { attachQualifyingStructure } from './attachQualifyingStructure';

export function addQualifyingStructure(params) {
  const { structure, link } = generateQualifyingStructure(params);
  const drawDefinition = params.drawDefinition;

  return attachQualifyingStructure({
    tournamentId: params.tournamentRecord?.tournamentId,
    eventId: params.event?.eventId || params.eventId,
    drawDefinition,
    structure,
    link,
  });
}
