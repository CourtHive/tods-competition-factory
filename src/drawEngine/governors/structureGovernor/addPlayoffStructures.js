import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';
import { attachPlayoffStructures } from './attachStructures';

export function addPlayoffStructures(params) {
  const { structures, links, matchUpModifications } =
    generateAndPopulatePlayoffStructures(params);
  const drawDefinition = params.drawDefinition;

  return attachPlayoffStructures({
    tournamentId: params.tournamentRecord?.tournamentId,
    eventId: params.event?.eventId || params.eventId,
    matchUpModifications,
    drawDefinition,
    structures,
    links,
  });
}
