import mocksEngine from '@Assemblies/engines/mock';
import { printGlobalLog } from '@Functions/global/globalLog';
import tournamentEngine from '@Tests/engines/syncEngine';
import fs from 'fs';
import { expect, test } from 'vitest';

// constants
import { COMPASS, FIRST_MATCH_LOSER_CONSOLATION } from '@Constants/drawDefinitionConstants';
import { COMPLETED, RETIRED, TO_BE_PLAYED, WALKOVER } from '@Constants/matchUpStatusConstants';
import { unique } from '@Tools/arrays';

const factory = { tournamentEngine };

test.for([
  [
    {
      matchUpStatus: WALKOVER,
      winningSide: 2,
      matchUpStatusCodes: ['W1'], //injury
    },
    { expectedBackDrawMatchUpStatus: WALKOVER, expectedBackDrawMatchUpStatusCodes: ['W1'] },
  ],
  [
    {
      matchUpStatus: WALKOVER,
      winningSide: 2,
      matchUpStatusCodes: ['W2'], //illness
    },
    { expectedBackDrawMatchUpStatus: WALKOVER, expectedBackDrawMatchUpStatusCodes: ['W2'] },
  ],
  [
    {
      matchUpStatus: RETIRED,
      winningSide: 2,
      matchUpStatusCodes: ['RJ'], //illness
    },
    { expectedBackDrawMatchUpStatus: WALKOVER, expectedBackDrawMatchUpStatusCodes: ['RJ'] },
  ],
])('can propagate an exit status', ([outcome, expected]) => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawId, drawSize: 32, drawType: FIRST_MATCH_LOSER_CONSOLATION, idPrefix }],
    setState: true,
  });

  tournamentEngine.devContext(true);

  let matchUpId = 'matchUp-1-1';
  let result = tournamentEngine.setMatchUpStatus({
    outcome,
    propagateExitStatus: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId }).matchUps;
  let matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp?.matchUpStatus).toEqual(outcome.matchUpStatus);

  // when propagating RETIRED status, the loserMatchUp should be marked as WALKOVER
  let loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(loserMatchUp?.matchUpStatus).toEqual(expected.expectedBackDrawMatchUpStatus);
  expect(loserMatchUp?.matchUpStatusCodes).toEqual(expected.expectedBackDrawMatchUpStatusCodes);

  // TODO: question is whether the CONSOLATION matchUp with WALKOVER and no winningSide should be considered a downstream dependency
  // and whether the WALKOVER status should be removed when trying to remove the result from the original matchUp

  // result = tournamentEngine.setMatchUpStatus({
  //   outcome: { matchUpStatus: TO_BE_PLAYED, winningSide: undefined },
  //   matchUpId,
  //   drawId,
  // });
  // expect(result.success).toEqual(true);

  // matchUp = factory.tournamentEngine
  //   .allDrawMatchUps({ drawId })
  //   .matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  // expect(matchUp?.matchUpStatus).toEqual('TO_BE_PLAYED');
  // expect(matchUp?.winningSide).toBe(undefined);

  // loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  // expect(loserMatchUp?.matchUpStatus).toEqual('TO_BE_PLAYED');

  printGlobalLog(true);
});

test('can propagate an exit status', () => {
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

  // set this to true to see the glovalLog printout at the end of the test
  // as long as the pushGlobalLog function has been called at some point
  tournamentEngine.devContext(false);

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

  tournamentEngine.devContext(false);

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

  const fileName = `propagateExitStatus.tods.json`;
  const dirPath = './src/scratch/';
  if (fs.existsSync(dirPath)) {
    const output = `${dirPath}${fileName}`;
    fs.writeFileSync(output, JSON.stringify(tournamentEngine.getTournament(), null, 2));
  }

  printGlobalLog(true);
});
