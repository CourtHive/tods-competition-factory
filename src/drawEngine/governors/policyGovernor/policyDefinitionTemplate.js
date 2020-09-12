export const policyTemplate = () => ({
  seeding: {
    seedBlocks: {},
    duplicateSeedNumbers: true,
  },
  scoring: {
    requireAllPositionsAssigned: true,
  },
});

export default policyTemplate;
