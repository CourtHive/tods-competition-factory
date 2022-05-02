import { generateQualifyingStructure } from './generateQualifyingStructure';
import { attachQualifyingStructure } from './attachQualifyingStructure';

export function addQualifyingStructure(params) {
  const { structures, links } = generateQualifyingStructure(params);
  const drawDefinition = params.drawDefinition;

  return attachQualifyingStructure({
    tournamentId: params.tournamentRecord?.tournamentId,
    eventId: params.event?.eventId || params.eventId,
    drawDefinition,
    structures,
    links,
  });
}
