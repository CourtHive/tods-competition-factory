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

  let igMatchUps = matchUps.map((m) => m.inferredGender).filter(Boolean);
  expect(igMatchUps.length).toBeGreaterThanOrEqual(1);

  // without contextProfile there are no inferredGender matchUps
  let result = tournamentEngine.getParticipants({ withMatchUps: true });
  igMatchUps = result.matchUps.map((m) => m.inferredGender).filter(Boolean);
  expect(igMatchUps.length).toEqual(0);

  result = tournamentEngine.getParticipants({
    contextProfile: { inferGender: true },
    withMatchUps: true,
  });

  igMatchUps = result.matchUps.map((m) => m.inferredGender).filter(Boolean);
  expect(igMatchUps.length).toBeGreaterThanOrEqual(1);
});
