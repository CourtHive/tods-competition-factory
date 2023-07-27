import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import { expect, it } from 'vitest';

import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';

it('round robins with timed formats will default to game based when no indicator', () => {
  // TODO: investigate whether mocksEngine can generate timed results
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    randomWinningSide: true,
    drawProfiles: [
      { drawSize: 4, drawType: ROUND_ROBIN, matchUpFormat: 'SET1-S:T20' },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  // Expect thhere to be a single set in every matchUp
  expect(matchUps.every(({ score }) => score.sets.length === 1)).toEqual(true);

  const { drawId, structureId } = matchUps[0];
  const positionAssignments = tournamentEngine.getPositionAssignments({
    structureId,
    drawId,
  }).positionAssignments;

  const p1Result = positionAssignments[0].extensions[0].value;
  const { gamesWon, gamesLost, pointsWon, pointsLost } = p1Result;
  expect(gamesWon + gamesLost).toBeGreaterThan(1);
  expect(pointsWon + pointsLost).toEqual(0);
});

it.only('round robins with points based timed formats to tally points not games', () => {
  // TODO: investigate whether mocksEngine can generate timed results
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    completeAllMatchUps: true,
    randomWinningSide: true,
    drawProfiles: [
      { drawSize: 4, drawType: ROUND_ROBIN, matchUpFormat: 'SET1-S:T20P' },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  // Expect thhere to be a single set in every matchUp
  expect(matchUps.every(({ score }) => score.sets.length === 1)).toEqual(true);

  const { drawId, structureId } = matchUps[0];
  const positionAssignments = tournamentEngine.getPositionAssignments({
    structureId,
    drawId,
  }).positionAssignments;

  const p1Result = positionAssignments[0].extensions[0].value;
  const { gamesWon, gamesLost, pointsWon, pointsLost } = p1Result;
  expect(gamesWon + gamesLost).toBeGreaterThan(1);
  expect(pointsWon + pointsLost).toEqual(0);
});
