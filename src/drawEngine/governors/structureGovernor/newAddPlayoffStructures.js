import { attachPlayoffStructures } from './attachPlayoffStructures';
import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';

export function newAddPlayoffStructures(params) {
  const { structures, links } = generateAndPopulatePlayoffStructures(params);
  const drawDefinition = params.drawDefinition;

  return attachPlayoffStructures({ drawDefinition, structures, links });
}
