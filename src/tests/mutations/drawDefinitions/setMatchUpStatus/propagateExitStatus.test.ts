import tournamentEngine from '@Tests/engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { unique } from '@Tools/arrays';
import { expect, test } from 'vitest';

// constants
import { COMPASS, CURTIS_CONSOLATION, FIRST_MATCH_LOSER_CONSOLATION } from '@Constants/drawDefinitionConstants';
import {
  COMPLETED,
  DEFAULTED,
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
  RETIRED,
  TO_BE_PLAYED,
  WALKOVER,
} from '@Constants/matchUpStatusConstants';

const factory = { tournamentEngine };

test.for([
  [
    {
      //outcome
      matchUpStatus: WALKOVER,
      winningSide: 2,
      matchUpStatusCodes: ['W1'], //injury
    },
    { expectedBackDrawMatchUpStatus: WALKOVER, expectedBackDrawMatchUpStatusCodes: ['W1'] },
  ],
  [
    {
      //outcome
      matchUpStatus: WALKOVER,
      winningSide: 2,
      matchUpStatusCodes: ['W2'], //illness
    },
    { expectedBackDrawMatchUpStatus: WALKOVER, expectedBackDrawMatchUpStatusCodes: ['W2'] },
  ],
  [
    {
      //outcome
      matchUpStatus: DEFAULTED,
      winningSide: 2,
      matchUpStatusCodes: ['DM'], //misconduct
    },
    { expectedBackDrawMatchUpStatus: DEFAULTED, expectedBackDrawMatchUpStatusCodes: ['DM'] },
  ],
  [
    {
      //outcome
      // when propagating RETIRED status, the loserMatchUp should be marked as WALKOVER
      matchUpStatus: RETIRED,
      winningSide: 2,
      matchUpStatusCodes: ['RJ'], //Injury
    },
    { expectedBackDrawMatchUpStatus: WALKOVER, expectedBackDrawMatchUpStatusCodes: ['RJ'] },
  ],
])('can propagate an %s exit status and result in a %s', ([outcome, expected]) => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawId, drawSize: 32, drawType: FIRST_MATCH_LOSER_CONSOLATION, idPrefix }],
    setState: true,
  });

  tournamentEngine.devContext(true);

  let matchUpId = 'matchUp-1-1';
  let result =tournamentEngine.setMatchUpStatus({
    outcome,
    propagateExitStatus: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
  let matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp?.matchUpStatus).toEqual(outcome.matchUpStatus);
  expect(matchUp?.readyToScore).toEqual(false);
  expect(matchUp?.winningSide).toEqual(2);

  let loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(loserMatchUp?.matchUpStatus).toEqual(expected.expectedBackDrawMatchUpStatus);
  expect(loserMatchUp?.matchUpStatusCodes).toEqual(expected.expectedBackDrawMatchUpStatusCodes);
});

test(`it sets the correct status codes in a consolation match when a WO is propagated to a match with already an opponent.`, () => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawId, drawSize: 32, drawType: FIRST_MATCH_LOSER_CONSOLATION, idPrefix }],
    setState: true,
  });

  tournamentEngine.devContext(true);

  let matchUpId = 'matchUp-1-1';
  let result =tournamentEngine.setMatchUpStatus({
    outcome:{
      score: {
          scoreStringSide: "[11-3]",
          scoreStringSide2: "[3-11]",
      },
      matchUpStatus:COMPLETED,
      matchUpStatusCodes: [],
      winningSide: 1,
    },
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  let matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
  let matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp?.matchUpStatus).toEqual(COMPLETED);
  expect(matchUp?.readyToScore).toEqual(false);
  expect(matchUp?.winningSide).toEqual(1);

  matchUpId = 'matchUp-1-2';
  result =tournamentEngine.setMatchUpStatus({
    outcome: 
    {
      //outcome
      matchUpStatus: WALKOVER,
      winningSide: 2,
      matchUpStatusCodes: ['W2'], //illness
    },
    propagateExitStatus:true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  //making sure we get the updated matchups data
  matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
  matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  //get the updated loser matchup
  let loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(loserMatchUp?.matchUpStatus).toEqual(WALKOVER);
  //this should have the status codes set
  expect(loserMatchUp?.matchUpStatusCodes).toEqual(['W2'])

})

test.for([
  [
    {
      //outcome
      matchUpStatus: WALKOVER,
      winningSide: 1,
      matchUpStatusCodes: ['W1'], //injury
    },
    { expectedBackDrawMatchUpStatus: DOUBLE_WALKOVER, expectedBackDrawMatchUpStatusCodes: ['WO', 'W1'] },
  ],
  [
    {
      //outcome
      matchUpStatus: WALKOVER,
      winningSide: 2,
      matchUpStatusCodes: ['W1'], //injury
    },
    { expectedBackDrawMatchUpStatus: DOUBLE_WALKOVER, expectedBackDrawMatchUpStatusCodes: ['WO', 'W1'] },
  ],
  [
    {
      //outcome
      matchUpStatus: DEFAULTED,
      winningSide: 1,
      matchUpStatusCodes: ['DM'],
    },
    { expectedBackDrawMatchUpStatus: DOUBLE_WALKOVER, expectedBackDrawMatchUpStatusCodes: ['WO', 'DM'] },
  ],
  [
    {
      //outcome
      matchUpStatus: DEFAULTED,
      winningSide: 2,
      matchUpStatusCodes: ['DM'],
    },
    { expectedBackDrawMatchUpStatus: DOUBLE_WALKOVER, expectedBackDrawMatchUpStatusCodes: ['WO', 'DM'] },
  ],
])(
  'can propagate a %s to a consolation match with already the result of a double walkover, resulting in %s',
  ([outcome, expected]) => {
    const idPrefix = 'matchUp';
    const drawId = 'drawId';
    mocksEngine.generateTournamentRecord({
      drawProfiles: [{ drawId, drawSize: 32, drawType: FIRST_MATCH_LOSER_CONSOLATION, idPrefix }],
      setState: true,
    });

    tournamentEngine.devContext(true);

    //setting first match as DOUBLE WALKOVER
    const firstMatchUpId = 'matchUp-1-1';
    let result = tournamentEngine.setMatchUpStatus({
      outcome: {
        //outcome
        matchUpStatus: DOUBLE_WALKOVER,
        matchUpStatusCodes: ['WOWO', 'WOWO'],
      },
      matchUpId: firstMatchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    //setting second match based on input
    const secondMatchUpId = 'matchUp-1-2';
    result = tournamentEngine.setMatchUpStatus({
      outcome,
      propagateExitStatus: true,
      matchUpId: secondMatchUpId,
      drawId,
    });
    expect(result.success).toEqual(true);

    const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
    let matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === secondMatchUpId);
    expect(matchUp?.matchUpStatus).toEqual(outcome.matchUpStatus);
    expect(matchUp?.readyToScore).toEqual(false);
    expect(matchUp?.winningSide).toEqual(outcome.winningSide);
    //consolation match should result in a DOUBLE_WALKOVER
    let loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
    expect(loserMatchUp?.matchUpStatus).toEqual(expected.expectedBackDrawMatchUpStatus);
    expect(loserMatchUp?.matchUpStatusCodes).toEqual(expected.expectedBackDrawMatchUpStatusCodes);
  },
);

test('can propagate a default to a consolation match with already the result of a double default, resulting in a DOUBLE_WALKOVER', () => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawId, drawSize: 32, drawType: FIRST_MATCH_LOSER_CONSOLATION, idPrefix }],
    setState: true,
  });

  //setting first match as DOUBLE DEFAULT
  const firstMatchUpId = 'matchUp-1-1';
  let result = tournamentEngine.setMatchUpStatus({
    outcome: {
      //outcome
      matchUpStatus: DOUBLE_DEFAULT,
      matchUpStatusCodes: ['DD', 'DD'],
    },
    matchUpId: firstMatchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  //setting second match as a DEFAULT
  const secondMatchUpId = 'matchUp-1-2';
  result = tournamentEngine.setMatchUpStatus({
    outcome: {
      matchUpStatus: DEFAULTED,
      winningSide: 2,
      matchUpStatusCodes: ['DM'],
    },
    propagateExitStatus: true,
    matchUpId: secondMatchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
  let matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === secondMatchUpId);
  expect(matchUp?.matchUpStatus).toEqual(DEFAULTED);
  expect(matchUp?.readyToScore).toEqual(false);
  expect(matchUp?.winningSide).toEqual(2);
  //consolation match should result in a DOUBLE_WALKOVER
  let loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(loserMatchUp?.matchUpStatus).toEqual(DOUBLE_WALKOVER);
  expect(loserMatchUp?.matchUpStatusCodes).toEqual(['WO', 'DM']);
});

test('can propagate an exit status and progress the already existing opponent in the back draw match', () => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawId, drawSize: 32, drawType: FIRST_MATCH_LOSER_CONSOLATION, idPrefix }],
    setState: true,
  });

  tournamentEngine.devContext(true);

  let matchUpId = 'matchUp-1-1';
  let result = tournamentEngine.setMatchUpStatus({
    outcome: {
      score: {
        scoreStringSide1: '[11-3]',
        scoreStringSide2: '[3-11]',
        sets: [
          {
            setNumber: 1,
            side1TiebreakScore: 11,
            side2TiebreakScore: 3,
            winningSide: 1,
          },
        ],
      },
      matchUpStatus: 'COMPLETED',
      status: {
        side1: {
          categoryName: 'Winner',
          subCategoryName: 'Winner',
          matchUpStatusCodeDisplay: 'Winner',
          matchUpStatusCode: '',
        },
        side2: {
          categoryName: 'None',
          subCategoryName: 'None',
          matchUpStatusCodeDisplay: 'None',
          matchUpStatusCode: '',
        },
      },
      winningSide: 1,
      matchUpFormat: 'SET1-S:TB11NOAD',
    },
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  //set a walkover to then feed the loser to the consolation draw with already one player.
  matchUpId = 'matchUp-1-2';
  result = tournamentEngine.setMatchUpStatus({
    outcome: {
      //outcome
      matchUpStatus: WALKOVER,
      winningSide: 2,
      matchUpStatusCodes: ['W1'], //injury
    },
    matchUpId,
    drawId,
    propagateExitStatus: true,
  });
  expect(result.success).toEqual(true);

  const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
  let matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp?.matchUpStatus).toEqual(WALKOVER);
  expect(matchUp?.readyToScore).toEqual(false);
  expect(matchUp?.winningSide).toEqual(2);

  let loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(loserMatchUp?.matchUpStatus).toEqual(WALKOVER);
  expect(loserMatchUp?.winningSide).toEqual(1);
});

test('can propagate an exit status in a compass draw', () => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [
      // uuids are popped and therefore assigned in reverse order
      // in this instance the uuids are assigned to structureIds in the order they are generated
      { drawId, drawSize: 32, drawType: COMPASS, idPrefix, uuids: ['a8', 'a7', 'a6', 'a5', 'a4', 'a3', 'a2', 'a1'] },
    ],
    setState: true,
  });

  let matchUpId = 'matchUp-East-RP-1-1';
  let result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: WALKOVER, winningSide: 2 },
    propagateExitStatus: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId }).matchUps;
  const matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp?.matchUpStatus).toEqual(WALKOVER);
  const westLoserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(westLoserMatchUp?.matchUpStatus).toEqual(WALKOVER);
  const southLoserMatchUp = matchUps?.find((mU) => mU.matchUpId === westLoserMatchUp?.loserMatchUpId);
  expect(southLoserMatchUp?.matchUpStatus).toEqual(WALKOVER);
  const southEastLoserMatchUp = matchUps?.find((mU) => mU.matchUpId === southLoserMatchUp?.loserMatchUpId);
  expect(southEastLoserMatchUp?.matchUpStatus).toEqual(WALKOVER);

  // create an outcome for completing matchUps
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });

  // now complete all remaining first round matchUps in the EAST structure
  let readyToScore = tournamentEngine
    .allTournamentMatchUps()
    .matchUps.filter((m) => m.readyToScore && m.matchUpStatus === TO_BE_PLAYED);

  // for a drawSize of 32 there should be 15 remaining matchUps readyToScore
  // 1 of the 16 first round EAST matchUps was a WALKOVER so only 15 remain
  expect(readyToScore.length).toEqual(15);

  let scoreResults = readyToScore.map((m) => {
    const { matchUpId, drawId } = m;
    const result = tournamentEngine.setMatchUpStatus({ matchUpId, drawId, outcome });
    return result.success;
  });
  expect(unique(scoreResults)).toEqual([true]);

  // now complete all remaining first round matchUps in the WEST structure
  // only WEST will have first round matchUps which are both readyToScore and TO_BE_PLAYED
  readyToScore = tournamentEngine
    .allTournamentMatchUps()
    .matchUps.filter((m) => m.readyToScore && m.matchUpStatus === TO_BE_PLAYED && m.roundNumber === 1);

  // for a drawSize of 32 there should be 7 remaining matchUps readyToScore in the WEST structure
  // 1 of the 8 first round WEST matchUps was a WALKOVER so only 7 remain
  expect(readyToScore.length).toEqual(7);

  scoreResults = readyToScore.map((m) => {
    const { matchUpId, drawId } = m;
    const result = tournamentEngine.setMatchUpStatus({ matchUpId, drawId, outcome });
    return result.success;
  });
  expect(unique(scoreResults)).toEqual([true]);

  // now complete all remaining first round matchUps in the SOUTH structure
  // only SOUTH will have first round matchUps which are both readyToScore and TO_BE_PLAYED
  readyToScore = tournamentEngine
    .allTournamentMatchUps()
    .matchUps.filter((m) => m.readyToScore && m.matchUpStatus === TO_BE_PLAYED && m.roundNumber === 1);

  // for a drawSize of 32 there should be 4 remaining matchUps readyToScore in the SOUTH structure
  // 1 of the 4 first round SOUTH matchUps was a WALKOVER so only 3 remain
  expect(readyToScore.length).toEqual(3);

  scoreResults = readyToScore.map((m) => {
    const { matchUpId, drawId } = m;
    const result = tournamentEngine.setMatchUpStatus({ matchUpId, drawId, outcome });
    return result.success;
  });
  expect(unique(scoreResults)).toEqual([true]);

  // now complete all remaining first round matchUps in the SOUTHEAST structure
  // only SOUTHEAST will have first round matchUps which are both readyToScore and TO_BE_PLAYED
  readyToScore = tournamentEngine
    .allTournamentMatchUps()
    .matchUps.filter((m) => m.readyToScore && m.matchUpStatus === TO_BE_PLAYED && m.roundNumber === 1);

  // for a drawSize of 32 there should be 2 remaining matchUps readyToScore in the SOUTHEAST structure
  // 1 of the 2 first round SOUTH matchUps was a WALKOVER so only 1 remains
  expect(readyToScore.length).toEqual(1);

  scoreResults = readyToScore.map((m) => {
    const { matchUpId, drawId } = m;
    const result = tournamentEngine.setMatchUpStatus({ matchUpId, drawId, outcome });
    return result.success;
  });
  expect(unique(scoreResults)).toEqual([true]);
});

test('can automatically progress the winner in a feed in round that already had a propagated WO participant fed in', () => {
  const idPrefix = 'm';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawId,
        drawSize: 32,
        drawType: CURTIS_CONSOLATION,
        idPrefix,
        outcomes: [
          {
            roundPosition: 1,
            scoreString: '6-2 6-1',
            roundNumber: 1,
            winningSide: 1,
          },
          {
            scoreString: '6-2 6-1',
            roundPosition: 2,
            roundNumber: 1,
            winningSide: 1,
          },
          {
            roundPosition: 15,
            scoreString: '6-2 6-1',
            roundNumber: 1,
            winningSide: 1,
          },
          {
            scoreString: '6-2 6-1',
            roundPosition: 16,
            roundNumber: 1,
            winningSide: 1,
          },
        ],
      },
    ],
    setState: true,
  });
  //setting round 2 match 1 as a WO and propagating the exit to the consolation draw
  let matchUpId = 'm-2-1';
  let result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: WALKOVER, winningSide: 2, matchUpStatusCodes:['W0'] },
    propagateExitStatus: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  //making sure the consolation draw is now set as a WO
  const consolationFedInMatchUpId = 'm-c0-2-8';
  let matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
  let consolationFedInMatchUp = matchUps?.find((matchUp) => matchUp.matchUpId === consolationFedInMatchUpId);
  expect(consolationFedInMatchUp?.matchUpStatus).toEqual(WALKOVER);

  //now we set the score for the first round consolation draw that will progress to the consolationFedInMatchUp
  const { outcome } = mocksEngine.generateOutcomeFromScoreString({
    matchUpStatus: COMPLETED,
    scoreString: '6-1 6-1',
    winningSide: 1,
  });
  let firstRoundConsolationMatchUpId = 'm-c0-1-8';
  result = tournamentEngine.setMatchUpStatus({
    outcome,
    matchUpId: firstRoundConsolationMatchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  //check that the winner has progress to consolationFedInMatchUp and also then progress to round 3
  matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId, inContext: true }).matchUps;
  consolationFedInMatchUp = matchUps?.find((matchUp) => matchUp.matchUpId === consolationFedInMatchUpId);
  expect(consolationFedInMatchUp?.matchUpStatus).toEqual(WALKOVER);
  expect(consolationFedInMatchUp?.winningSide).toEqual(2);
  const winnerParticipantId = consolationFedInMatchUp?.sides[consolationFedInMatchUp?.winningSide-1].participantId;
  
  const round3ConsolationMatchUpId = 'm-c0-3-4'
  const round3ConsolationMatchUp = matchUps?.find((matchUp) => matchUp.matchUpId === round3ConsolationMatchUpId);
  expect(round3ConsolationMatchUp?.sides?.[0].participantId).toBeUndefined
  //making sure the progressed player is the one that was mark as the winner in the fed in round
  expect(round3ConsolationMatchUp?.sides?.[1].participantId).toEqual(winnerParticipantId)
  
});