import policyTemplate from './policyDefinitionTemplate';
import {
  getAppliedPolicies,
  getEventAppliedPolicies,
} from './getAppliedPolicies';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_EVENT,
  MISSING_POLICY_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
  INVALID_POLICY_DEFINITION,
  EXISTING_POLICY_TYPE,
  POLICY_NOT_ATTACHED,
  POLICY_NOT_FOUND,
  INVALID_OBJECT,
} from '../../../constants/errorConditionConstants';

export function addPolicyDefinition({ tournamentRecord, policyDefinition }) {
  const errors = [];
  if (!policyDefinition || typeof policyDefinition !== 'object') {
    errors.push({ error: MISSING_POLICY_DEFINITION });
    return { errors };
  }

  if (!tournamentRecord.extensions) tournamentRecord.extensions = [];
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });

  Object.keys(policyDefinition).forEach((policyType) => {
    if (!appliedPolicies[policyType]) {
      appliedPolicies[policyType] = policyDefinition[policyType];
    } else {
      errors.push({ error: EXISTING_POLICY_TYPE });
    }
  });

  if (!errors.length) {
    tournamentRecord.extensions = tournamentRecord.extensions.filter(
      (extension) => extension.name !== 'appliedPolicies'
    );
    tournamentRecord.extensions.push({
      name: 'appliedPolicies',
      value: appliedPolicies,
    });
  }

  return errors.length ? errors : SUCCESS;
}

function addPolicy({ policies, policyDefinition }) {
  if (typeof policyDefinition !== 'object') return { error: INVALID_OBJECT };
  if (!validDefinitionKeys(policyDefinition))
    return { error: INVALID_POLICY_DEFINITION };
  Object.assign(policies, policyDefinition);
  return SUCCESS;
}

export function attachPolicy({ tournamentRecord, policies, policyDefinition }) {
  if (!tournamentRecord) {
    return { error: MISSING_TOURNAMENT_RECORD };
  }
  let result = addPolicy({ policies, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  result = addPolicyDefinition({ tournamentRecord, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  return SUCCESS;
}

export function attachEventPolicy({
  tournamentRecord,
  event,
  policyDefinition,
}) {
  if (!tournamentRecord) {
    return { error: MISSING_TOURNAMENT_RECORD };
  }
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
    if (policyDefinition[policyType].policyAttributes) {
      appliedPolicies[policyType] = policyDefinition[policyType];
      policiesApplied++;
    }
  });

  event.extensions = event.extensions.filter(
    (extension) => extension.name !== 'appliedPolicies'
  );
  event.extensions.push({ name: 'appliedPolicies', value: appliedPolicies });

  return policiesApplied ? SUCCESS : { error: POLICY_NOT_ATTACHED };
}

export function removeEventPolicy({ tournamentRecord, event, policyType }) {
  if (!tournamentRecord) {
    return { error: MISSING_TOURNAMENT_RECORD };
  }
  if (!event) {
    return { error: MISSING_EVENT };
  }

  let policyRemoved;

  if (event.extensions) {
    const { appliedPolicies } = getEventAppliedPolicies({ event });
    if (appliedPolicies && policyType && appliedPolicies[policyType]) {
      delete appliedPolicies[policyType];
      policyRemoved = true;

      event.extensions = event.extensions.filter(
        (extension) => extension.name !== 'appliedPolicies'
      );

      if (Object.keys(appliedPolicies).length) {
        event.extensions.push({
          name: 'appliedPolicies',
          value: appliedPolicies,
        });
      }
    }
  }
  return policyRemoved ? SUCCESS : { error: POLICY_NOT_FOUND };
}

function validDefinitionKeys(definition) {
  const definitionKeys = Object.keys(definition);
  const validKeys = Object.keys(policyTemplate());
  const valid = definitionKeys.reduce(
    (p, key) => (!validKeys.includes(key) ? false : p),
    true
  );
  return valid;
}
