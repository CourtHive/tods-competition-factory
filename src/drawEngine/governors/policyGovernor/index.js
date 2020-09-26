import policyTemplate from './policyDefinitionTemplate';
import { SUCCESS } from '../../../constants/resultConstants';

/*
   pull seedBlocks out of current policy
*/
function getSeedBlocks({ policies }) {
  const { seeding } = policies;
  if (!seeding) return { error: 'No seeding policy defined' };

  const { seedBlocks, policyType } = seeding;
  return Object.assign({ seedBlocks, policyType }, SUCCESS);
}

function getSeedingConfig({ policies }) {
  const { seeding } = policies;
  if (!seeding) return { error: 'No seeding policy defined' };

  const { duplicateSeedNumbers } = seeding;
  return Object.assign({ duplicateSeedNumbers }, SUCCESS);
}

function requireAllPositionsAssigned({ policies }) {
  const { scoring } = policies;
  if (!scoring) return { error: 'No scoring policy defined' };

  return Object.assign(
    { required: scoring.requireAllPositionsAssigned },
    SUCCESS
  );
}

function addPolicyProfile({ drawDefinition, policyDefinition }) {
  if (!drawDefinition.appliedPolicies) drawDefinition.appliedPolicies = [];
  if (!policyDefinition || typeof policyDefinition !== 'object') {
    return { errors: [{ error: 'Missing Policy Definition' }] };
  }
  Object.keys(policyDefinition).forEach(policyClass => {
    const policyType = policyDefinition[policyClass].policyType;
    if (policyType) {
      const profileExists = drawDefinition.appliedPolicies.reduce(
        (exists, profile) => {
          return profile.policyType === policyType &&
            policyDefinition.policyClass === policyClass
            ? exists || true
            : exists;
        },
        false
      );
      if (!profileExists) {
        const appliedPolicy = { policyClass, policyType };
        if (policyDefinition[policyClass].policyAttributes) {
          appliedPolicy.policyAttributes =
            policyDefinition[policyClass].policyAttributes;
        }
        drawDefinition.appliedPolicies.push(appliedPolicy);
      }
    }
  });
}

function removePolicies({ policies }) {
  Object.keys(policies).forEach(key => delete policies[key]);
  return SUCCESS;
}

function addPolicy({ policies, policyDefinition }) {
  if (typeof policyDefinition !== 'object') return { error: 'Invalid Object' };
  if (!validDefinitionKeys(policyDefinition))
    return { error: 'Invalid Definition' };
  Object.assign(policies, policyDefinition);
  return SUCCESS;
}

function attachPolicy({ drawDefinition, policies, policyDefinition }) {
  if (!drawDefinition) {
    return { error: 'Missing drawDefinition' };
  }
  let result = addPolicy({ policies, policyDefinition });
  if (result && result.errors) return { error: result.errors };
  result = addPolicyProfile({ drawDefinition, policyDefinition });
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
  removePolicies,

  getSeedBlocks,
  getSeedingConfig,
  requireAllPositionsAssigned,
};

export default policyGovernor;
