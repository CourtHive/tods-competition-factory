import { POLICY_TYPE_ROUND_NAMING } from '../../constants/policyConstants';

export const ROUND_NAMING_DEFAULT = {
  [POLICY_TYPE_ROUND_NAMING]: {
    policyName: 'Round Naming Default',
    finishingRoundNameMap: {
      '1': 'F',
      '2': 'SF',
      '3': 'QF',
    },
    prefix: {
      roundNumber: 'R',
      preFeedRound: 'Q',
    },
  },
};

export default ROUND_NAMING_DEFAULT;
