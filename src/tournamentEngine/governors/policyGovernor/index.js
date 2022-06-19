import { getAppliedPolicies } from '../../../global/functions/deducers/getAppliedPolicies';
import { getAllowedDrawTypes, getAllowedMatchUpFormats } from './allowedTypes';
import { getEntriesAndSeedsCount } from './getEntriesAndSeedsCount';
import { getSeedsCount } from './getSeedsCount';
import { findPolicy } from './findPolicy';

import {
  attachPolicies,
  attachEventPolicies,
  removeEventPolicy,
} from './policyManagement';

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
