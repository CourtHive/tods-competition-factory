import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { removePolicy } from '../../../mutate/extensions/policies/removePolicy';

export const policyGovernor = {
  attachPolicies,
  removePolicy,
};

export default policyGovernor;
