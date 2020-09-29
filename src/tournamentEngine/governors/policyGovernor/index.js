import policyTemplate from './policyDefinitionTemplate';
import { getAppliedPolicies } from './getAppliedPolicies';
import { allowedDrawTypes, allowedScoringFormats } from './allowedTypes';

import { SUCCESS } from '../../../constants/resultConstants';

function addPolicyProfile({ tournamentRecord, policyDefinition }) {
  const errors = [];
  if (!policyDefinition || typeof policyDefinition !== 'object') {
    errors.push({ error: 'Missing Policy Definition' });
    return { errors };
  }

  if (!tournamentRecord.extensions) tournamentRecord.extensions = [];
  const { appliedPolicies } = getAppliedPolicies({ tournamentRecord });

  Object.keys(policyDefinition).forEach(policyType => {
    if (!appliedPolicies[policyType]) {
      appliedPolicies[policyType] = policyDefinition[policyType];
    } else {
      errors.push({ error: `Policy ${policyType} already applied` });
    }
  });

  if (!errors.length) {
    tournamentRecord.extensions = tournamentRecord.extensions.filter(
      extension => extension.name !== 'appliedPolicies'
    );
    tournamentRecord.extensions.push({
      name: 'appliedPolicies',
      value: appliedPolicies,
    });
  }

  return errors.length ? errors : SUCCESS;
}

function addPolicy({ policies, policyDefinition }) {
  if (typeof policyDefinition !== 'object') return { error: 'Invalid Object' };
  if (!validDefinitionKeys(policyDefinition))
    return { error: 'Invalid Definition' };
  Object.assign(policies, policyDefinition);
  return SUCCESS;
}

function attachPolicy({ tournamentRecord, policies, policyDefinition }) {
  if (!tournamentRecord) {
    return { error: 'Missing tournamentRecord' };
  }
  let result = addPolicy({ policies, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  result = addPolicyProfile({ tournamentRecord, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  return SUCCESS;
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

const policyGovernor = {
  attachPolicy,
  allowedDrawTypes,
  allowedScoringFormats,
};

export default policyGovernor;
