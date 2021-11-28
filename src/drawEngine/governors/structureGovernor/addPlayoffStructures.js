import { attachPlayoffStructures } from './attachPlayoffStructures';
import { generateAndPopulatePlayoffStructures } from './generateAndPopulatePlayoffStructures';

export function addPlayoffStructures(params) {
  const { structures, links } = generateAndPopulatePlayoffStructures(params);
  const drawDefinition = params.drawDefinition;

  return attachPlayoffStructures({ drawDefinition, structures, links });
}
