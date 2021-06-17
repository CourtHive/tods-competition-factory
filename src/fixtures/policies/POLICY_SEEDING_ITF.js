import { CLUSTER } from '../../constants/drawDefinitionConstants';
import { POLICY_TYPE_SEEDING } from '../../constants/policyConstants';

export const POLICY_SEEDING_ITF = {
  [POLICY_TYPE_SEEDING]: {
    policyName: 'ITF',
    seedingProfile: CLUSTER,
    duplicateSeedNumbers: true,
  },
};

export default POLICY_SEEDING_ITF;
