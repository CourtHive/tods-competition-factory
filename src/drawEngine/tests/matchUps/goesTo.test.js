import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../../tournamentEngine/sync';

import {
  CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  MAIN,
} from '../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../constants/eventConstants';
import { MALE } from '../../../constants/genderConstants';

it('accurately determines winnerGoesTo and loserGoesTo for FIC matchUps', () => {
  const participantsProfile = {
    participantsCount: 8,
    sex: MALE,
  };
  const drawProfiles = [
    {
      drawSize: 32,
      eventType: SINGLES,
      participantsCount: 17,
      drawType: FEED_IN_CHAMPIONSHIP,
      feedPolicy: { roundGroupedOrder: [] },
    },
  ];
  let {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles,
    participantsProfile,
    goesTo: true,
  });

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allDrawMatchUps({
    drawId,
    inContext: true,
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

  let { winnerGoesTo, loserGoesTo } = findTargetMatchUpByAttributes({
    matchUps,
    stage,
    roundNumber,
    roundPosition,
  });
  const expectedWinnerMatchUp = findTargetMatchUpByAttributes({
    matchUps,
    stage: winnerStage,
    roundNumber: winnerRoundNumber,
    roundPosition: winnerRoundPosition,
  });
  const expectedloserMatchUp = findTargetMatchUpByAttributes({
    matchUps,
    stage: loserStage,
    roundNumber: loserRoundNumber,
    roundPosition: loserRoundPosition,
  });

  expect(winnerGoesTo).toEqual(expectedWinnerMatchUp.matchUpId);
  expect(loserGoesTo).toEqual(expectedloserMatchUp.matchUpId);

  function findTargetMatchUpByAttributes({
    matchUps,
    roundNumber,
    roundPosition,
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
