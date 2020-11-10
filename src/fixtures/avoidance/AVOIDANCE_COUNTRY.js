import { POLICY_TYPE_AVOIDANCE } from '../../constants/policyConstants';

export const AVOIDANCE_COUNTRY = {
  [POLICY_TYPE_AVOIDANCE]: {
    roundsToSeparate: undefined,
    policyName: 'Nationality Code',
    policyAttributes: [
      { key: 'person.nationalityCode' },
      { key: 'individualParticipants.person.nationalityCode' },
    ],
  },
};

export default AVOIDANCE_COUNTRY;
