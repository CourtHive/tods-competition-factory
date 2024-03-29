import { POLICY_TYPE_DRAWS } from '@Constants/policyConstants';

export const POLICY_DRAWS_DEFAULT = {
  [POLICY_TYPE_DRAWS]: {
    drawTypeCoercion: { AD_HOC: false }, // example of how to set a default for a specific drawType
    // drawTypeCoercion: { ROUND_ROBIN_WITH_PLAYOFF: 5 }, // example of how to set a minimum # of participants for a specific drawType
    // drawTypeCoercion: true, // example of how to set a default for all drawTypes
  },
};

export default POLICY_DRAWS_DEFAULT;
