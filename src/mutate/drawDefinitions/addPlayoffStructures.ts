import { generateAndPopulatePlayoffStructures } from '../../assemblies/generators/drawDefinitions/generateAndPopulatePlayoffStructures';
import { attachPlayoffStructures } from './attachStructures';

export function addPlayoffStructures(params) {
  const { structures, links, matchUpModifications, error } = generateAndPopulatePlayoffStructures(params);
  if (error) return { error };

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
