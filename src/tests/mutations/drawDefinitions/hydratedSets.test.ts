import tournamentEngine from '@Engines/syncEngine';
import { mocksEngine } from '../../..';
import { expect, test } from 'vitest';

test('inContext matchUp score.sets include timed boolean for timed sets', () => {
  const mockProfile = {
    drawProfiles: [{ drawSize: 4, matchUpFormat: 'SET3-S:T20' }],
    completeAllMatchUps: true,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  // T20 is a timed format, not a tiebreak-only format
  matchUps[0].score.sets.forEach((set) => expect(set.timed).toEqual(true));
});

test('inContext matchUp score.sets include tiebreakSet boolean for tiebreak-only sets', () => {
  const mockProfile = {
    drawProfiles: [{ drawSize: 4, matchUpFormat: 'SET3-S:TB20' }],
    completeAllMatchUps: true,
  };
  const { tournamentRecord } = mocksEngine.generateTournamentRecord(mockProfile);

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  // TB20 is a tiebreak-only format
  matchUps[0].score.sets.forEach((set) => expect(set.tiebreakSet).toEqual(true));
});
