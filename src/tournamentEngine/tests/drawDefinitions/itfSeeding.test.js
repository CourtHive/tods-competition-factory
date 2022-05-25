import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('can generate draw with appropriate ITF seeding', () => {
  const seeding = {
    policyName: 'ITF',
    seedingProfile: 'CLUSTER',
    duplicateSeedNumbers: true,
  };

  const mocksProfile = {
    drawProfiles: [
      {
        drawSize: 32,
        drawId: '12U',
        category: { categoryName: '12U' },
        rankingRange: [1, 15],
        policyDefinitions: { seeding },
        seedsCount: 8,
      },
    ],
  };
  const { tournamentRecord } =
    mocksEngine.generateTournamentRecord(mocksProfile);

  tournamentEngine.setState(tournamentRecord);

  expect(
    tournamentRecord.events[0].drawDefinitions[0].structures[0].seedAssignments
      .length
  ).toEqual(4);
});
