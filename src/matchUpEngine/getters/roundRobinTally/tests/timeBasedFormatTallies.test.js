import { getParticipantId } from '../../../../global/functions/extractors';
import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import matchUpEngine from '../../../sync';
import { expect, it } from 'vitest';

import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';

it('round robins with timed formats will default to game based when no indicator', () => {
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

it('round robins with points based timed formats to tally points not games', () => {
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
  expect(pointsWon + pointsLost).toBeGreaterThan(1);
  expect(gamesWon + gamesLost).toEqual(0);
});

it('can tally points when different finalSet format', () => {
  const matchUpFormat = 'SET3-S:6/TB7-F:T20P';
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 4, matchUpFormat }],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  let matchUp = matchUps[0];

  expect(matchUp.matchUpFormat).toEqual(matchUpFormat);

  // verify that square brackets denote points
  let outcome = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 1-6 [23-45]',
  }).outcome;
  outcome.winningSide = 2;
  let thirdSet = outcome.score.sets.find(({ setNumber }) => setNumber === 3);
  expect(thirdSet.winningSide).toEqual(2);
  expect(thirdSet.side1TiebreakScore).toEqual(23);
  expect(thirdSet.side2TiebreakScore).toEqual(45);

  // no square brackets denotes games...
  // ...but in this case the matchUpFormat will ensure result is calculated as points
  outcome = mocksEngine.generateOutcomeFromScoreString({
    scoreString: '6-1 1-6 23-45',
  }).outcome;
  outcome.winningSide = 2;
  thirdSet = outcome.score.sets.find(({ setNumber }) => setNumber === 3);
  expect(thirdSet.winningSide).toEqual(2);
  expect(thirdSet.side1Score).toEqual(23);
  expect(thirdSet.side2Score).toEqual(45);

  const { matchUpId, drawId } = matchUp;
  result = tournamentEngine.setMatchUpStatus({ matchUpId, outcome, drawId });
  expect(result.success).toEqual(true);

  matchUp = tournamentEngine.findMatchUp({
    inContext: true,
    matchUpId,
    drawId,
  }).matchUp;

  let { participantResults } = matchUpEngine.tallyParticipantResults({
    matchUps: [matchUp],
  });
  const sideIds = matchUp.sides
    .sort((a, b) => a.sideNumber - b.sideNumber) // ensure sides are ordered
    .map(getParticipantId);
  const sideTallies = sideIds.map((id) => participantResults[id]);

  let { gamesWon, gamesLost, pointsWon, pointsLost } = sideTallies[0];
  expect(pointsLost).toEqual(45);
  expect(pointsWon).toEqual(23);
  expect(gamesLost).toEqual(7);
  expect(gamesWon).toEqual(7);

  ({ gamesWon, gamesLost, pointsWon, pointsLost } = sideTallies[1]);
  expect(pointsLost).toEqual(23);
  expect(pointsWon).toEqual(45);
  expect(gamesLost).toEqual(7);
  expect(gamesWon).toEqual(7);
});
