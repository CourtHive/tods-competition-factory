import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import {
  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
} from '../../../query/tournaments/allowedTypes';
import { getEntriesAndSeedsCount } from './getEntriesAndSeedsCount';
import { getSeedsCount } from './getSeedsCount';
import { findPolicy } from '../../../acquire/findPolicy';

import { removeEventPolicy } from '../../../mutate/extensions/policies/policyManagement';
import { attachPolicies } from '../../../mutate/extensions/policies/attachPolicies';

const policyGovernor = {
  attachPolicies,
  removeEventPolicy,
  findPolicy,

  getSeedsCount,
  getEntriesAndSeedsCount,

  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
  getAppliedPolicies,
};

export default policyGovernor;
