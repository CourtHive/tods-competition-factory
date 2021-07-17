import mocksEngine from '../..';

test('mocksEngine supports devContext', () => {
  const { tournamentRecord } = mocksEngine
    .devContext(true)
    .generateTournamentRecord();
  expect(tournamentRecord).not.toBeUndefined();
});
