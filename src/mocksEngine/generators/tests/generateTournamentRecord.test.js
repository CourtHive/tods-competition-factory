import mocksEngine from '../..';

test('generateTournamentRecord', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  expect(Object.keys(tournamentRecord)).toEqual([
    'startDate',
    'endDate',
    'tournamentName',
    'tournamentId',
    'participants',
  ]);
});
