import { setSubscriptions } from '../../../global/state/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import {
  BYE,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

const getTarget = ({ matchUps, roundNumber, roundPosition, stage }) =>
  matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition &&
      (!stage || matchUp.stage === stage)
  );

test('Double Exit produces exit in consolation', () => {
  // keep track of notficiations with each setMatchUpStatus event
  let modifiedMatchUpLog = [];
  let result = setSubscriptions({
    subscriptions: {
      [MODIFY_MATCHUP]: (matchUps) => {
        matchUps.forEach(({ matchUp }) => {
          const { roundNumber, roundPosition, matchUpStatus, stage } = matchUp;
          modifiedMatchUpLog.push([
            matchUpStatus,
            roundPosition,
            roundNumber,
            stage,
          ]);
        });
      },
    },
  });
  expect(result.success).toEqual(true);

  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        drawType: FIRST_MATCH_LOSER_CONSOLATION,
        drawSize: 8,
        outcomes: [
          {
            matchUpStatus: DOUBLE_WALKOVER,
            roundPosition: 1,
            roundNumber: 1,
          },
          {
            roundPosition: 2,
            roundNumber: 1,
            winningSide: 1,
          },
        ],
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  expect(modifiedMatchUpLog.length).toEqual(7);

  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

  let targetMatchUp = getTarget({
    stage: CONSOLATION,
    roundPosition: 1,
    roundNumber: 1,
    matchUps,
  });

  expect(targetMatchUp.winningSide).toEqual(2);
  const losingSideMatchUpStatusCode = targetMatchUp.matchUpStatusCodes.find(
    (side) => side.sideNumber === 1
  ).previousMatchUpStatus;
  expect(losingSideMatchUpStatusCode).toEqual(DOUBLE_WALKOVER);
  expect(targetMatchUp.matchUpStatus).toEqual(WALKOVER);

  targetMatchUp = getTarget({
    stage: CONSOLATION,
    roundPosition: 1,
    roundNumber: 2,
    matchUps,
  });
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);
  expect(targetMatchUp.drawPositions).toEqual([1, 3]);

  targetMatchUp = getTarget({
    stage: MAIN,
    roundPosition: 1,
    roundNumber: 1,
    matchUps,
  });

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    drawId: targetMatchUp.drawId,
    outcome: toBePlayed,
  });

  expect(result.success).toEqual(true);

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

  targetMatchUp = getTarget({
    stage: CONSOLATION,
    roundPosition: 1,
    roundNumber: 1,
    matchUps,
  });

  expect(targetMatchUp.matchUpStatus).toEqual(TO_BE_PLAYED);
  expect(targetMatchUp.winningSide).toEqual(undefined);

  targetMatchUp = getTarget({
    stage: CONSOLATION,
    roundPosition: 1,
    roundNumber: 2,
    matchUps,
  });

  expect(targetMatchUp.drawPositions.filter(Boolean)).toEqual([1]);
  expect(targetMatchUp.matchUpStatus).toEqual(BYE);
  expect(targetMatchUp.winningSide).toEqual(undefined);
});
