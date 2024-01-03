import { POLICY_TYPE_DRAWS } from '../../constants/policyConstants';

export const POLICY_DRAWS_DEFAULT = {
  [POLICY_TYPE_DRAWS]: {
    drawTypeCoercion: { AD_HOC: false }, // example of how to set a default for a specific drawType
    // drawTypeCoercion: true, // example of how to set a default for all drawTypes
  },
};

export default POLICY_DRAWS_DEFAULT;
