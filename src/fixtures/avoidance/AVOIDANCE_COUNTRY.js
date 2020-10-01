export const AVOIDANCE_COUNTRY = {
  avoidance: {
    avoidanceMode: 'maximum', // maximum || firstRound
    policyName: 'Nationality Code',
    policyAttributes: [
      'person.nationalityCode',
      'individualParticipants.person.nationalityCode',
    ],
  },
};

export default AVOIDANCE_COUNTRY;
