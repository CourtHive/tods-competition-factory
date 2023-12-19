import { getAppliedPolicies } from '../../../query/extensions/getAppliedPolicies';
import {
  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
} from '../../../query/tournament/allowedTypes';
import { getEntriesAndSeedsCount } from './getEntriesAndSeedsCount';
import { getSeedsCount } from './getSeedsCount';
import { findPolicy } from '../../../acquire/findPolicy';

import {
  attachPolicies,
  attachEventPolicies,
  removeEventPolicy,
} from '../../../mutate/extensions/policies/policyManagement';

const policyGovernor = {
  attachPolicies,
  attachEventPolicies,
  removeEventPolicy,
  findPolicy,

  getSeedsCount,
  getEntriesAndSeedsCount,

  getAllowedDrawTypes,
  getAllowedMatchUpFormats,
  getAppliedPolicies,
};

export default policyGovernor;
