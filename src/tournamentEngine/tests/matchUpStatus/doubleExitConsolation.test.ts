import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import {
  printGlobalLog,
  pushGlobalLog,
} from '../../../global/functions/globalLog';
import {
  setDevContext,
  setSubscriptions,
} from '../../../global/state/globalState';

import { toBePlayed } from '../../../fixtures/scoring/outcomes/toBePlayed';
import { MODIFY_MATCHUP } from '../../../constants/topicConstants';
import {
  BYE,
  COMPLETED,
  DOUBLE_WALKOVER,
  TO_BE_PLAYED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';
import {
  CONSOLATION,
  FIRST_MATCH_LOSER_CONSOLATION,
  MAIN,
} from '../../../constants/drawDefinitionConstants';

const getTarget = (params) => {
  const { matchUps, roundNumber, roundPosition, stage } = params;
  return matchUps.find(
    (matchUp) =>
      matchUp.roundNumber === roundNumber &&
      matchUp.roundPosition === roundPosition &&
      (!stage || matchUp.stage === stage)
  );
};

const scenarios = [
  {
    skip: false,
    devContext: false,
    modifiedMatchUpsCount: 7,
    outcomes: [
      {
        roundPosition: 1,
        roundNumber: 1,
        winningSide: 1,
      },
      {
        matchUpStatus: DOUBLE_WALKOVER,
        roundPosition: 2,
        roundNumber: 1,
      },
    ],
    preRemovalChecks: [
      {
        stage: MAIN,
        matchUpStatus: DOUBLE_WALKOVER,
        drawPositions: [3, 4],
        roundNumber: 1,
        roundPosition: 2,
      },
      {
        stage: MAIN,
        matchUpStatus: WALKOVER,
        drawPositions: [1],
        roundNumber: 2,
        roundPosition: 1,
        winningSide: 1,
      },
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [1],
        roundNumber: 3,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: WALKOVER,
        drawPositions: [3, 4],
        losingSideMatchUpStatusCode: DOUBLE_WALKOVER,
        roundNumber: 1,
        roundPosition: 1,
        winningSide: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: BYE,
        drawPositions: [1, 3],
        roundNumber: 2,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [3],
        roundNumber: 3,
        roundPosition: 1,
      },
    ],
    postRemovalChecks: [
      {
        stage: MAIN,
        matchUpStatus: COMPLETED,
        drawPositions: [1, 2],
        roundNumber: 1,
        roundPosition: 1,
        winningSide: 1,
      },
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [3, 4],
        roundNumber: 1,
        roundPosition: 2,
      },
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [1],
        roundNumber: 2,
        roundPosition: 1,
      },
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: undefined,
        roundNumber: 3,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: undefined,
        roundNumber: 3,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [3, 4],
        roundNumber: 1,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: BYE,
        drawPositions: [1],
        roundNumber: 2,
        roundPosition: 1,
      },
    ],
  },
  {
    skip: false,
    devContext: false,
    modifiedMatchUpsCount: 8,
    updates: [
      {
        matchUpStatus: DOUBLE_WALKOVER,
        roundPosition: 1,
        roundNumber: 1,
        stage: MAIN,
      },
      {
        roundPosition: 2,
        roundNumber: 1,
        winningSide: 1,
        stage: MAIN,
      },
    ],
    preRemovalChecks: [
      {
        stage: MAIN,
        matchUpStatus: DOUBLE_WALKOVER,
        drawPositions: [1, 2],
        roundNumber: 1,
        roundPosition: 1,
      },
      {
        stage: MAIN,
        matchUpStatus: WALKOVER,
        drawPositions: [3],
        roundNumber: 2,
        roundPosition: 1,
        winningSide: 2,
      },
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [3],
        roundNumber: 3,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: WALKOVER,
        drawPositions: [3, 4],
        losingSideMatchUpStatusCode: DOUBLE_WALKOVER,
        roundNumber: 1,
        roundPosition: 1,
        winningSide: 2,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: BYE,
        drawPositions: [1, 4],
        roundNumber: 2,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [4],
        roundNumber: 3,
        roundPosition: 1,
      },
    ],
    postRemovalChecks: [
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [1, 2],
        roundNumber: 1,
        roundPosition: 1,
      },
      {
        stage: MAIN,
        matchUpStatus: COMPLETED,
        drawPositions: [3, 4],
        roundNumber: 1,
        roundPosition: 2,
        winningSide: 1,
      },
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [3],
        roundNumber: 2,
        roundPosition: 1,
      },
      {
        stage: MAIN,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: undefined,
        roundNumber: 3,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: undefined,
        roundNumber: 3,
        roundPosition: 1,
      },
      {
        stage: CONSOLATION,
        matchUpStatus: TO_BE_PLAYED,
        drawPositions: [3, 4],
        roundNumber: 1,
        roundPosition: 1,
      },
      {
        includeCheck: true,
        stage: CONSOLATION,
        matchUpStatus: BYE,
        drawPositions: [1],
        roundNumber: 2,
        roundPosition: 1,
      },
    ],
  },
];

test.each(scenarios)('Double Exit produces exit in consolation', (params) => {
  const preRemovalChecks: any = params.preRemovalChecks;
  const postRemovalChecks: any = params.postRemovalChecks;
  const { modifiedMatchUpsCount, devContext, outcomes, updates, skip } = params;
  if (skip) return;

  setDevContext(devContext);

  // keep track of notficiations with each setMatchUpStatus event
  const modifiedMatchUpLog: any[] = [];
  let result = setSubscriptions({
    subscriptions: {
      [MODIFY_MATCHUP]: (matchUps) => {
        matchUps.forEach(({ matchUp }) => {
          const { roundNumber, roundPosition, matchUpStatus } = matchUp;
          modifiedMatchUpLog.push([matchUpStatus, roundNumber, roundPosition]);
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
        outcomes,
      },
    ],
  });

  const doubleWalkoverOutcome = (outcomes || updates)?.find(
    ({ matchUpStatus }) => matchUpStatus === DOUBLE_WALKOVER
  );

  tournamentEngine.setState(tournamentRecord);
  let matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

  if (updates?.length) {
    for (const update of updates) {
      const targetMatchUp = getTarget({
        ...update,
        matchUps,
      });
      const result = tournamentEngine.setMatchUpStatus({
        matchUpId: targetMatchUp.matchUpId,
        drawId: targetMatchUp.drawId,
        outcome: update,
      });
      expect(result.success).toEqual(true);
    }
  }

  if (modifiedMatchUpsCount) {
    expect(modifiedMatchUpLog.length).toEqual(modifiedMatchUpsCount);
  }

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;
  pushGlobalLog('doubleExitConsolation');

  // remove the DOUBLE_WALKOVER
  if (preRemovalChecks?.length) {
    for (const check of preRemovalChecks) {
      const targetMatchUp = getTarget({
        ...check,
        matchUps,
      });
      if (check.includeCheck !== false) {
        expect(targetMatchUp.drawPositions?.filter(Boolean)).toEqual(
          check.drawPositions
        );
        expect(targetMatchUp.matchUpStatus).toEqual(check.matchUpStatus);
        expect(targetMatchUp.winningSide).toEqual(check.winningSide);
      }
      const { roundNumber, roundPosition } = targetMatchUp;
      const color =
        JSON.stringify(targetMatchUp.drawPositions) !==
        JSON.stringify(check.drawPositions)
          ? 'brightmagenta'
          : 'brightgreen';
      pushGlobalLog({
        method: 'before',
        keyColors: {
          stage: 'brightcyan',
          round: 'brightcyan',
          target: color,
          check: 'bright',
        },
        stage: targetMatchUp.stage,
        round: [roundNumber, roundPosition],
        target: JSON.stringify(targetMatchUp.drawPositions),
        check: JSON.stringify(check.drawPositions),
      });

      if (check.losingSideMatchUpStatusCode) {
        const losingSideMatchUpStatusCode =
          targetMatchUp.matchUpStatusCodes.find(
            (side) => side.sideNumber !== targetMatchUp.winningSide
          ).previousMatchUpStatus;
        expect(losingSideMatchUpStatusCode).toEqual(
          check.losingSideMatchUpStatusCode
        );
      }
    }
  }

  pushGlobalLog('----------');

  let targetMatchUp = getTarget({
    ...doubleWalkoverOutcome,
    stage: MAIN,
    matchUps,
  });

  result = tournamentEngine.setMatchUpStatus({
    matchUpId: targetMatchUp.matchUpId,
    drawId: targetMatchUp.drawId,
    outcome: toBePlayed,
  });
  expect(result.success).toEqual(true);

  pushGlobalLog('----------');

  matchUps = tournamentEngine.allTournamentMatchUps().matchUps;

  if (postRemovalChecks?.length) {
    for (const check of postRemovalChecks) {
      targetMatchUp = getTarget({
        ...check,
        matchUps,
      });
      const color =
        JSON.stringify(targetMatchUp.drawPositions) !==
        JSON.stringify(check.drawPositions)
          ? 'brightmagenta'
          : 'brightgreen';
      const { roundNumber, roundPosition } = targetMatchUp;
      pushGlobalLog({
        method: 'after',
        keyColors: {
          stage: 'brightcyan',
          round: 'brightcyan',
          target: color,
          check: 'bright',
        },
        stage: targetMatchUp.stage,
        round: [roundNumber, roundPosition],
        target: JSON.stringify(targetMatchUp.drawPositions),
        check: JSON.stringify(check.drawPositions),
      });
      if (check.includeCheck !== false) {
        expect(targetMatchUp.drawPositions?.filter(Boolean)).toEqual(
          check.drawPositions
        );
        expect(targetMatchUp.matchUpStatus).toEqual(check.matchUpStatus);
        expect(targetMatchUp.winningSide).toEqual(check.winningSide);
      }
    }
  }

  printGlobalLog(true);
  // reset
  setDevContext();
});
