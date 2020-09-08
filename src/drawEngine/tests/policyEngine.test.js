import { drawEngine } from '../../drawEngine';
import { getPolicyEngine } from '../../drawEngine';

import { ERROR, SUCCESS } from '../../constants/resultConstants';
import ITF_SEEDING from '../../fixtures/SEEDING_ITF';

it('can set and reset policy engine', () => {
  let result;
  const { policyEngine } = getPolicyEngine();
  
  expect(policyEngine).toHaveProperty('loadPolicy');
  expect(policyEngine).toHaveProperty('getSeedBlocks');
  
  let seedBlocks = policyEngine.getSeedBlocks();
  expect(seedBlocks).toHaveProperty(ERROR);
 
  // cannot load a policy if no drawDefinition
  drawEngine.loadPolicy(ITF_SEEDING);
  let errors = drawEngine.getErrors();
  expect(errors).toMatchObject([{"error": "Missing drawDefinition"}]);
 
  drawEngine.newDrawDefinition();
  drawEngine.loadPolicy(ITF_SEEDING);
  errors = drawEngine.getErrors();
  expect(errors).toMatchObject([]);
  
  seedBlocks = policyEngine.getSeedBlocks();
  expect(seedBlocks).toMatchObject(SUCCESS);

  result = policyEngine.reset();
  expect(result).toMatchObject(SUCCESS);
  
  seedBlocks = policyEngine.getSeedBlocks();
  expect(seedBlocks).toHaveProperty(ERROR);
});

