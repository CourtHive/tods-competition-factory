import { drawEngine } from '..';

import { ERROR, SUCCESS } from '../../constants/resultConstants';
import ITF_SEEDING from '../../fixtures/SEEDING_ITF';

it('can set and reset policy governor', () => {
  expect(drawEngine).toHaveProperty('attachPolicy');
  expect(drawEngine).toHaveProperty('getSeedBlocks');

  let seedBlocks = drawEngine.getSeedBlocks();
  expect(seedBlocks).toHaveProperty(ERROR);

  // cannot load a policy if no drawDefinition
  drawEngine.reset();
  let result = drawEngine.attachPolicy({ policyDefinition: ITF_SEEDING });
  expect(result).toMatchObject({ error: 'Missing drawDefinition' });

  drawEngine.newDrawDefinition();
  const errors = drawEngine.getErrors();
  expect(errors).toMatchObject([]);

  result = drawEngine.attachPolicy({ policyDefinition: ITF_SEEDING });
  expect(result).toMatchObject(SUCCESS);
  seedBlocks = drawEngine.getSeedBlocks();
  expect(seedBlocks).toMatchObject(SUCCESS);

  result = drawEngine.removePolicies();
  expect(result).toMatchObject(SUCCESS);

  seedBlocks = drawEngine.getSeedBlocks();
  expect(seedBlocks).toHaveProperty(ERROR);
});
