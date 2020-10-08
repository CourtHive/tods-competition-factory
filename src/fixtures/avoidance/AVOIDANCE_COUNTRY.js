export const AVOIDANCE_COUNTRY = {
  avoidance: {
    roundsToSeparate: undefined,
    policyName: 'Nationality Code',
    policyAttributes: [
      { key: 'person.nationalityCode' },
      { key: 'individualParticipants.person.nationalityCode' },
    ],
  },
};

export default AVOIDANCE_COUNTRY;
