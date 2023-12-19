import { newDrawDefinition } from '../../../assemblies/generators/drawDefinitions/newDrawDefinition';
import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { expect, it } from 'vitest';

import { INVALID_VALUES } from '../../../constants/errorConditionConstants';
import SEEDING_ITF from '../../../fixtures/policies/POLICY_SEEDING_ITF';
import { SUCCESS } from '../../../constants/resultConstants';

it('can set and reset policy governor', () => {
  // cannot attach a policy if no drawDefinition
  let result = attachPolicies({ policyDefinitions: SEEDING_ITF });
  expect(result).toMatchObject({ error: INVALID_VALUES });

  const drawDefinition = newDrawDefinition();

  result = attachPolicies({ drawDefinition, policyDefinitions: SEEDING_ITF });
  expect(result).toMatchObject(SUCCESS);

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { seedingProfile, policyName } = appliedPolicies?.seeding ?? {};

  expect(policyName).toEqual('ITF SEEDING');
  expect(seedingProfile).not.toBeUndefined();
});
