import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import {
  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
} from '../../../query/tournaments/allowedTypes';
import { getEntriesAndSeedsCount } from './getEntriesAndSeedsCount';
import { getSeedsCount } from './getSeedsCount';
import { findPolicy } from '../../../acquire/findPolicy';

import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';
import { removePolicy } from '../../../mutate/extensions/policies/removePolicy';

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
