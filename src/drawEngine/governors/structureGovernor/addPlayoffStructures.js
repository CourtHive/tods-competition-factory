import { attachPlayoffStructures } from './attachPlayoffStructures';
import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';

export function addPlayoffStructures(params) {
  const { structures, links } = generateAndPopulatePlayoffStructures(params);
  const drawDefinition = params.drawDefinition;

  return attachPlayoffStructures({
    tournamentId: params.tournamentRecord?.tournamentId,
    eventId: params.event?.eventId || params.eventId,
    drawDefinition,
    structures,
    links,
  });
}
