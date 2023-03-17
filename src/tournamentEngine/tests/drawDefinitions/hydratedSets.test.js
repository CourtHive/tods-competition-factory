import tournamentEngine from '../../sync';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

test('inContext matchUp score.sets include tiebreakSet boolean', () => {
  const mockProfile = {
    drawProfiles: [{ drawSize: 4, matchUpFormat: 'SET3-S:T20' }],
    completeAllMatchUps: true,
  };
  const { tournamentRecord } =
    mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  matchUps[0].score.sets.forEach((set) =>
    expect(set.tiebreakSet).toEqual(true)
  );
});
