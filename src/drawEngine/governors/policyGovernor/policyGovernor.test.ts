import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { drawEngine } from '../../sync';
import { expect, it } from 'vitest';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';
import SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import { SUCCESS } from '../../../constants/resultConstants';

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
  const { seedingProfile, policyName } = appliedPolicies?.seeding || {};

  expect(policyName).toEqual('ITF SEEDING');
  expect(seedingProfile).not.toBeUndefined();
});
