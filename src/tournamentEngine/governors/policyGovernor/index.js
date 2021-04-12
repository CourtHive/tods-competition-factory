import { allowedDrawTypes, allowedMatchUpFormats } from './allowedTypes';
import { getEntriesAndSeedsCount } from './getEntriesAndSeedsCount';
import { getEventAppliedPolicies } from './getAppliedPolicies';
import { getSeedsCount } from './getSeedsCount';

import {
  attachPolicy,
  attachEventPolicy,
  removeEventPolicy,
} from './policyManagement';

const policyGovernor = {
  attachPolicy,
  attachEventPolicy,
  removeEventPolicy,

  getSeedsCount,
  getEntriesAndSeedsCount,

  allowedDrawTypes,
  allowedMatchUpFormats,
  getEventAppliedPolicies,
};

export default policyGovernor;
