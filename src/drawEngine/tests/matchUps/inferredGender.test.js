import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

test('contextProfile can specify inferGender', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 64 }],
    completeAllMatchUps: true,
  });
  tournamentEngine.setState(tournamentRecord);
  const { matchUps } = tournamentEngine.allTournamentMatchUps({
    contextProfile: { inferGender: true },
  });

  expect(
    matchUps.map((m) => m.inferredGender).filter(Boolean).length
  ).toBeGreaterThanOrEqual(1);
});
