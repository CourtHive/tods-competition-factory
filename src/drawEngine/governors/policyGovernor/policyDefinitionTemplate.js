export const policyTemplate = () => ({
  seeding: {
    seedCountThresholds: [],
    duplicateSeedNumbers: true,
  },
  scoring: {
    requireAllPositionsAssigned: true,
  },
  avoidance: {
    policyName: '',
    roundsToSeparate: undefined,
    policyAttributes: [],
  },
});

export default policyTemplate;
