import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { removePolicy } from '../../../mutate/extensions/policies/removePolicy';
import { findPolicy } from '../../../acquire/findPolicy';

export const policyGovernor = {
  attachPolicies,
  findPolicy,
  removePolicy,
};

export default policyGovernor;
