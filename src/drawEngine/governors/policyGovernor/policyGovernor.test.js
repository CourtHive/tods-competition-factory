import { drawEngine } from '../../sync';
import { getAppliedPolicies } from './getAppliedPolicies';

import { SUCCESS } from '../../../constants/resultConstants';
import SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

it('can set and reset policy governor', () => {
  expect(drawEngine).toHaveProperty('attachPolicies');

  drawEngine.reset();
  // cannot attach a policy if no drawDefinition
  let result = drawEngine.attachPolicies({ policyDefinitions: SEEDING_ITF });
  expect(result).toMatchObject({ error: MISSING_DRAW_DEFINITION });

  drawEngine.newDrawDefinition();

  result = drawEngine.attachPolicies({ policyDefinitions: SEEDING_ITF });
  expect(result).toMatchObject(SUCCESS);

  const { drawDefinition } = drawEngine.getState();
  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { seedingProfile, policyName } = appliedPolicies?.seeding;

  expect(policyName).toEqual('ITF');
  expect(seedingProfile).not.toBeUndefined();
});
