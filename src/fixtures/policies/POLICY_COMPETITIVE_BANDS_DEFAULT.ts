import { POLICY_TYPE_COMPETITIVE_BANDS } from '@Constants/policyConstants';

import { DECISIVE, ROUTINE } from '@Constants/statsConstants';

export const POLICY_COMPETITIVE_BANDS_DEFAULT = {
  [POLICY_TYPE_COMPETITIVE_BANDS]: {
    policyName: 'Competitive Bands Default',
    profileBands: {
      [DECISIVE]: 20,
      [ROUTINE]: 50,
    },
  },
};

export default POLICY_COMPETITIVE_BANDS_DEFAULT;
