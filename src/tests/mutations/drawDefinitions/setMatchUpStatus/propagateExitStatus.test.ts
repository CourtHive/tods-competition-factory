import { printGlobalLog } from '@Functions/global/globalLog';
import tournamentEngine from '@Tests/engines/syncEngine';
import mocksEngine from '@Assemblies/engines/mock';
import { expect, test } from 'vitest';

// constants
import { COMPASS, FIRST_MATCH_LOSER_CONSOLATION } from '@Constants/drawDefinitionConstants';
import { WALKOVER } from '@Constants/matchUpStatusConstants';

const factory = { tournamentEngine };

test.skip('can propagate an exit status', () => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawId, drawSize: 32, drawType: FIRST_MATCH_LOSER_CONSOLATION, idPrefix }],
    setState: true,
  });

  let matchUpId = 'matchUp-1-1';
  let result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: WALKOVER, winningSide: 2 },
    propagateExitStatus: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId }).matchUps;
  const matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp?.matchUpStatus).toEqual('WALKOVER');
  const loserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(loserMatchUp?.matchUpStatus).toEqual('WALKOVER');
});

test('can propagate an exit status', () => {
  const idPrefix = 'matchUp';
  const drawId = 'drawId';
  mocksEngine.generateTournamentRecord({
    drawProfiles: [
      { drawId, drawSize: 32, drawType: COMPASS, idPrefix, uuids: ['a1', 'a2', 'a3', 'a4', 'a5', 'a6', 'a7', 'a8'] },
    ],
    setState: true,
  });

  const log = false;
  tournamentEngine.devContext({ log });

  let matchUpId = 'matchUp-East-RP-1-1';
  let result = tournamentEngine.setMatchUpStatus({
    outcome: { matchUpStatus: WALKOVER, winningSide: 2 },
    propagateExitStatus: true,
    matchUpId,
    drawId,
  });
  console.log({ result });
  // expect(result.success).toEqual(true);

  const matchUps = factory.tournamentEngine.allDrawMatchUps({ drawId }).matchUps;
  const matchUp = matchUps?.find((matchUp) => matchUp.matchUpId === matchUpId);
  expect(matchUp?.matchUpStatus).toEqual('WALKOVER');
  const westLoserMatchUp = matchUps?.find((mU) => mU.matchUpId === matchUp?.loserMatchUpId);
  expect(westLoserMatchUp?.matchUpStatus).toEqual('WALKOVER');

  // NOTE: not yet propagating beyond first connected structure; likely propgateExitStatus not propagating in this scenario
  const southLoserMatchUp = matchUps?.find((mU) => mU.matchUpId === westLoserMatchUp?.loserMatchUpId);
  console.log({ southLoserMatchUp });
  //expect(southLoserMatchUp?.matchUpStatus).toEqual('WALKOVER');
  printGlobalLog(log);
});
