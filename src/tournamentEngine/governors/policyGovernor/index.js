import { getEventAppliedPolicies } from './getAppliedPolicies';
import { allowedDrawTypes, allowedMatchUpFormats } from './allowedTypes';
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

  allowedDrawTypes,
  allowedMatchUpFormats,
  getEventAppliedPolicies,
};

export default policyGovernor;
