import { drawEngine } from '..';
import { getAppliedPolicies } from '../governors/policyGovernor/getAppliedPolicies';

import { SUCCESS } from '../../constants/resultConstants';
import ITF_SEEDING from '../../fixtures/SEEDING_ITF';

it('can set and reset policy governor', () => {
  expect(drawEngine).toHaveProperty('attachPolicy');

  // cannot load a policy if no drawDefinition
  drawEngine.reset();
  let result = drawEngine.attachPolicy({ policyDefinition: ITF_SEEDING });
  expect(result).toMatchObject({ error: 'Missing drawDefinition' });

  drawEngine.newDrawDefinition();
  const errors = drawEngine.getErrors();
  expect(errors).toMatchObject([]);

  result = drawEngine.attachPolicy({ policyDefinition: ITF_SEEDING });
  expect(result).toMatchObject(SUCCESS);

  const { drawDefinition } = drawEngine.getState();
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { seedBlocks, policyName } = appliedPolicies?.seeding;

  expect(policyName).toEqual('ITF');
  expect(seedBlocks).not.toBeUndefined();
});
