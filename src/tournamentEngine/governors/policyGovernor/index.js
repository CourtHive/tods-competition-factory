import { allowedDrawTypes, allowedMatchUpFormats } from './allowedTypes';
import { getEntriesAndSeedsCount } from './getEntriesAndSeedsCount';
import { getEventAppliedPolicies } from './getAppliedPolicies';
import { getSeedsCount } from './getSeedsCount';
import { findPolicy } from './findPolicy';

import {
  attachPolicy,
  attachEventPolicy,
  removeEventPolicy,
} from './policyManagement';

const policyGovernor = {
  attachPolicy,
  attachEventPolicy,
  removeEventPolicy,
  findPolicy,

  getSeedsCount,
  getEntriesAndSeedsCount,

  allowedDrawTypes,
  allowedMatchUpFormats,
  getEventAppliedPolicies,
};

export default policyGovernor;
