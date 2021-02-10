import { drawEngine } from '../../sync';
import { getAppliedPolicies } from './getAppliedPolicies';

import { SUCCESS } from '../../../constants/resultConstants';
import ITF_SEEDING from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

it('can set and reset policy governor', () => {
  expect(drawEngine).toHaveProperty('attachPolicy');

  drawEngine.reset();
  // cannot attach a policy if no drawDefinition
  let result = drawEngine.attachPolicy({ policyDefinition: ITF_SEEDING });
  expect(result).toMatchObject({ error: MISSING_DRAW_DEFINITION });

  drawEngine.newDrawDefinition();

  result = drawEngine.attachPolicy({ policyDefinition: ITF_SEEDING });
  expect(result).toMatchObject(SUCCESS);

  const { drawDefinition } = drawEngine.getState();
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { seedBlocks, policyName } = appliedPolicies?.seeding;

  expect(policyName).toEqual('ITF');
  expect(seedBlocks).not.toBeUndefined();
});
