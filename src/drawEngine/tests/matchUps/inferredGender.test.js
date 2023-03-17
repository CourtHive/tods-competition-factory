import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';
import { expect, test } from 'vitest';

test('contextProfile can specify inferGender', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 64 }],
    completeAllMatchUps: true,
  });

  tournamentEngine.setState(tournamentRecord);
  let { matchUps } = tournamentEngine.allTournamentMatchUps({
    contextProfile: { inferGender: true },
  });

  expect(
    matchUps.map((m) => m.inferredGender).filter(Boolean).length
  ).toBeGreaterThanOrEqual(1);

  matchUps = tournamentEngine.allDrawMatchUps({
    contextProfile: { inferGender: true },
    inContext: true,
    drawId,
  }).matchUps;

  expect(
    matchUps.map((m) => m.inferredGender).filter(Boolean).length
  ).toBeGreaterThanOrEqual(1);
});
