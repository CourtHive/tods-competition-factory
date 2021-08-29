import {
  addEventExtension,
  addTournamentExtension,
  removeEventExtension,
} from '../tournamentGovernor/addRemoveExtensions';

import {
  getAppliedPolicies,
  getEventAppliedPolicies,
} from './getAppliedPolicies';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  EXISTING_POLICY_TYPE,
  POLICY_NOT_ATTACHED,
  POLICY_NOT_FOUND,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';
import { APPLIED_POLICIES } from '../../../constants/extensionConstants';

export function attachPolicy({
  tournamentRecord,
  policyDefinition,
  allowReplacement,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!policyDefinition || typeof policyDefinition !== 'object') {
    return { error: MISSING_POLICY_DEFINITION };
  }

  if (!tournamentRecord.extensions) tournamentRecord.extensions = [];
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });

  const applied = Object.keys(policyDefinition)
    .map((policyType) => {
      if (!appliedPolicies[policyType] || allowReplacement) {
        appliedPolicies[policyType] = policyDefinition[policyType];
        return policyType;
      }
    })
    .filter(Boolean);

  if (applied?.length) {
    const extension = {
      name: APPLIED_POLICIES,
      value: appliedPolicies,
    };
    const result = addTournamentExtension({ tournamentRecord, extension });
    if (result.error) return result;
  }

  return !applied?.length
    ? { error: EXISTING_POLICY_TYPE }
    : { ...SUCCESS, applied };
}

export function attachEventPolicy({ policyDefinition, event }) {
  if (!event) {
    return { error: MISSING_EVENT };
  }
  if (!policyDefinition) {
    return { error: MISSING_POLICY_DEFINITION };
  }

  let policiesApplied = 0;
  if (!event.extensions) event.extensions = [];
  const { appliedPolicies } = getEventAppliedPolicies({ event });

  Object.keys(policyDefinition).forEach((policyType) => {
    appliedPolicies[policyType] = policyDefinition[policyType];
    policiesApplied++;
  });

  if (policiesApplied) {
    const extension = { name: APPLIED_POLICIES, value: appliedPolicies };
    addEventExtension({ event, extension });
  }

  return policiesApplied ? SUCCESS : { error: POLICY_NOT_ATTACHED };
}

export function removeEventPolicy({ event, policyType }) {
  if (!policyType) return { error: MISSING_VALUE };
  if (!event) return { error: MISSING_EVENT };

  let policyRemoved;
  if (event.extensions) {
    const { appliedPolicies } = getEventAppliedPolicies({ event });
    if (appliedPolicies && appliedPolicies[policyType]) {
      delete appliedPolicies[policyType];
      policyRemoved = true;

      if (Object.keys(appliedPolicies).length) {
        const extension = { name: APPLIED_POLICIES, value: appliedPolicies };
        addEventExtension({ event, extension });
      } else {
        removeEventExtension({ event, name: APPLIED_POLICIES });
      }
    }
  }
  return policyRemoved ? SUCCESS : { error: POLICY_NOT_FOUND };
}
