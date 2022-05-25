import mocksEngine from '../../../mocksEngine';

it('can generate draw with appropriate ITF seeding', () => {
  const seeding = {
    policyName: 'ITF',
    duplicateSeedNumbers: true,
    drawSizeProgression: true,
    validSeedPositions: { ignore: true },
    seedingProfile: 'CLUSTER',
    seedsCountThresholds: [
      { drawSize: 4, minimumParticipantCount: 3, seedsCount: 2 },
      { drawSize: 16, minimumParticipantCount: 12, seedsCount: 4 },
      { drawSize: 32, minimumParticipantCount: 24, seedsCount: 8 },
      { drawSize: 64, minimumParticipantCount: 48, seedsCount: 16 },
      { drawSize: 128, minimumParticipantCount: 97, seedsCount: 32 },
      { drawSize: 256, minimumParticipantCount: 192, seedsCount: 64 },
    ],
  };

  let mockProfile = {
    drawProfiles: [
      {
        category: { categoryName: '12U' },
        policyDefinitions: { seeding },
        rankingRange: [1, 15],
        drawSize: 32,
        seedsCount: 8,
      },
    ],
  };

  let { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);
  expect(
    tournamentRecord.events[0].drawDefinitions[0].structures[0].seedAssignments
      .length
  ).toEqual(8);

  mockProfile = {
    drawProfiles: [
      {
        category: { categoryName: '12U' },
        policyDefinitions: { seeding },
        participantsCount: 23,
        rankingRange: [1, 15],
        seedsCount: 8,
        drawSize: 32,
      },
    ],
  };

  tournamentRecord =
    mocksEngine.generateTournamentRecord(mockProfile).tournamentRecord;
  expect(
    tournamentRecord.events[0].drawDefinitions[0].structures[0].seedAssignments
      .length
  ).toEqual(4);

  mockProfile = {
    drawProfiles: [
      {
        category: { categoryName: '12U' },
        policyDefinitions: { seeding },
        participantsCount: 96,
        rankingRange: [1, 32],
        seedsCount: 32,
        drawSize: 128,
      },
    ],
  };

  tournamentRecord =
    mocksEngine.generateTournamentRecord(mockProfile).tournamentRecord;
  expect(
    tournamentRecord.events[0].drawDefinitions[0].structures[0].seedAssignments
      .length
  ).toEqual(16);

  mockProfile = {
    drawProfiles: [
      {
        category: { categoryName: '12U' },
        policyDefinitions: { seeding },
        participantsCount: 97,
        rankingRange: [1, 32],
        seedsCount: 32,
        drawSize: 128,
      },
    ],
  };

  tournamentRecord =
    mocksEngine.generateTournamentRecord(mockProfile).tournamentRecord;
  expect(
    tournamentRecord.events[0].drawDefinitions[0].structures[0].seedAssignments
      .length
  ).toEqual(32);
});
