import { drawEngine } from '../..';
import { addPlayoffStructures } from '../../generators/addPlayoffStructures';

import { reset, initialize, mainDrawPositions } from '../primitives/primitives';

it('can add playoff structures to an elimination structure', () => {
  reset();
  initialize();
  mainDrawPositions({ drawSize: 16 });
  const result = drawEngine.generateDrawType();
  expect(result.success).toEqual(true);

  const {
    structure: { structureId },
  } = result;

  const { drawDefinition } = drawEngine.getState();

  addPlayoffStructures({ drawDefinition, structureId });
});
