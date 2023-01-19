import tournamentEngine from '../../../tournamentEngine/sync';
import mocksEngine from '../../../mocksEngine';

import { SINGLES } from '../../../constants/eventConstants';
import { MALE } from '../../../constants/genderConstants';
import {
  CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

it('accurately determines winnerMatchUpId and loserMatchUpId for FIC matchUps', () => {
  const participantsProfile = {
    participantsCount: 8,
    sex: MALE,
  };
  const drawProfiles = [
    {
      feedPolicy: { roundGroupedOrder: [] },
      drawType: FEED_IN_CHAMPIONSHIP,
      participantsCount: 17,
      eventType: SINGLES,
      drawSize: 32,
    },
  ];
  let {
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    drawProfiles,
    goesTo: true,
  });

  const { matchUps } = tournamentEngine
    .setState(tournamentRecord)
    .allDrawMatchUps({
      inContext: true,
      drawId,
    });

  checkGoesTo(matchUps, [MAIN, 1, 1, MAIN, 2, 1, CONSOLATION, 1, 1]);
  checkGoesTo(matchUps, [MAIN, 1, 2, MAIN, 2, 1, CONSOLATION, 1, 1]);
  checkGoesTo(matchUps, [MAIN, 1, 3, MAIN, 2, 2, CONSOLATION, 1, 2]);
  checkGoesTo(matchUps, [MAIN, 1, 4, MAIN, 2, 2, CONSOLATION, 1, 2]);

  // loser of 2nd round MAIN structure matchUp feeds into consolation bottom up
  checkGoesTo(matchUps, [MAIN, 2, 1, MAIN, 3, 1, CONSOLATION, 2, 8]);
});

function checkGoesTo(matchUps, expectation) {
  const [
    stage,
    roundNumber,
    roundPosition,
    winnerStage,
    winnerRoundNumber,
    winnerRoundPosition,
    loserStage,
    loserRoundNumber,
    loserRoundPosition,
  ] = expectation;

  let { winnerMatchUpId, loserMatchUpId } = findTargetMatchUpByAttributes({
    roundPosition,
    roundNumber,
    matchUps,
    stage,
  });
  const expectedWinnerMatchUp = findTargetMatchUpByAttributes({
    roundPosition: winnerRoundPosition,
    roundNumber: winnerRoundNumber,
    stage: winnerStage,
    matchUps,
  });
  const expectedloserMatchUp = findTargetMatchUpByAttributes({
    roundPosition: loserRoundPosition,
    roundNumber: loserRoundNumber,
    stage: loserStage,
    matchUps,
  });

  expect(winnerMatchUpId).toEqual(expectedWinnerMatchUp.matchUpId);
  expect(loserMatchUpId).toEqual(expectedloserMatchUp.matchUpId);

  function findTargetMatchUpByAttributes({
    roundPosition,
    roundNumber,
    matchUps,
    stage,
  }) {
    return matchUps.find(
      (matchUp) =>
        matchUp.stage === stage &&
        matchUp.roundNumber === roundNumber &&
        matchUp.roundPosition === roundPosition
    );
  }
}
