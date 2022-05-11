import mocksEngine from '../../mocksEngine';
import tournamentEngine from '../sync';

it('can generate competitive statistics for matchUps', () => {
  const mocksProfile = {
    drawProfiles: [{ drawSize: 32 }],
    completeAllMatchUps: true,
  };
  const { tournamentRecord } =
    mocksEngine.generateTournamentRecord(mocksProfile);

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();

  const result = tournamentEngine.getMatchUpsStats({ matchUps });
  expect(result.success).toEqual(true);
  const sum = Object.values(result.matchUpStats).reduce((a, b) => a + b);
  expect(sum).toEqual(100);
});
