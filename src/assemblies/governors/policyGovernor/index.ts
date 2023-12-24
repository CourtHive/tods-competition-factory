import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { removePolicy } from '../../../mutate/extensions/policies/removePolicy';

// the following should not be in this assembly - here now for backwards compatibility
import { getEntriesAndSeedsCount } from '../../../mutate/entries/getEntriesAndSeedsCount';
import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import { getSeedsCount } from '../../../query/drawDefinition/getSeedsCount';
import { findPolicy } from '../../../acquire/findPolicy';
import {
  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
} from '../../../query/tournaments/allowedTypes';

const policyGovernor = {
  attachPolicies,
  removePolicy,
  findPolicy,

  getSeedsCount,
  getEntriesAndSeedsCount,

  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
  getAppliedPolicies,
};

export default policyGovernor;
