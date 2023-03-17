import { setSubscriptions } from '../../../global/state/globalState';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { expect, test } from 'vitest';

import { USTA_GOLD_TEAM_CHALLENGE } from '../../../constants/tieFormatConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { TEAM } from '../../../constants/matchUpTypes';
import {
  MODIFY_DRAW_DEFINITION,
  MODIFY_MATCHUP,
} from '../../../constants/topicConstants';

// reusable
test('can clear TEAM matchUp "scorecards"', () => {
  let firstMatchUpTieMatchUpScoringLog = [];
  let firstMatchUpScoringLog = [];
  let modifiedMatchUpLog = [];

  let trackMatchUpModifications;
  let matchUpId;

  let result = setSubscriptions({
    subscriptions: {
      [MODIFY_MATCHUP]: (matchUps) => {
        if (trackMatchUpModifications) {
          matchUps.forEach(({ matchUp }) =>
            modifiedMatchUpLog.push({ [matchUp.matchUpId]: matchUp.score })
          );
        }
      },
      [MODIFY_DRAW_DEFINITION]: (result) => {
        const targetMatchUp =
          result[0].drawDefinition.structures[0].matchUps.find(
            (m) => m.matchUpId === matchUpId
          );
        if (targetMatchUp) {
          firstMatchUpScoringLog.push(targetMatchUp.score.scoreStringSide1);
          firstMatchUpTieMatchUpScoringLog.push(
            targetMatchUp.tieMatchUps.map((t) => t.score)
          );
        }
      },
    },
  });
  expect(result.success).toEqual(true);

  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [
      {
        tieFormatName: USTA_GOLD_TEAM_CHALLENGE,
        eventType: TEAM,
        drawSize: 4,
      },
    ],
  });

  tournamentEngine.setState(tournamentRecord);

  let outcome = {
    winningSide: 1,
    score: {
      scoreStringSide1: '8-1',
      scoreStringSide2: '1-8',
      sets: [
        {
          setNumber: 1,
          side1Score: 8,
          side2Score: 1,
          winningSide: 1,
        },
      ],
    },
  };

  let { matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    });

  expect(firstRoundDualMatchUps.length).toEqual(2);
  matchUpId = firstRoundDualMatchUps[0].matchUpId;

  // for all first round dualMatchUps complete all doubles matchUps
  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    dualMatchUp.tieMatchUps.slice(0, 9).forEach((matchUp) => {
      const { matchUpId } = matchUp;
      let result = tournamentEngine.setMatchUpStatus({
        matchUpId,
        outcome,
        drawId,
      });
      expect(result.success).toEqual(true);
    });
  });

  ({ matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    }));
  let targetMatchUp = firstRoundDualMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );
  expect(targetMatchUp.score.sets[0].side1Score).toEqual(9);

  firstRoundDualMatchUps.forEach((dualMatchUp) => {
    const { winningSide, matchUpStatus, score, tieMatchUps } = dualMatchUp;
    expect(matchUpStatus).toEqual(COMPLETED);
    expect(tieMatchUps.length).toEqual(16);
    expect(winningSide).toEqual(1);
    expect(score).toEqual({
      scoreStringSide1: '9-0',
      scoreStringSide2: '0-9',
      sets: [{ side1Score: 9, side2Score: 0, winningSide: 1 }],
    });
  });

  let {
    matchUps: [secondRoundDualMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [2],
    },
  });
  expect(secondRoundDualMatchUp.drawPositions).toEqual([1, 3]);

  trackMatchUpModifications = true;
  result = tournamentEngine.resetScorecard({
    tiebreakReset: true,
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  modifiedMatchUpLog.forEach((log) => {
    const values = Object.values(log).filter(Boolean);
    if (values.length) {
      expect(values.length).toEqual(1);
      expect(values[0].scoreStringSide1).toEqual('');
    }
  });

  // prettier-ignore
  expect(firstMatchUpScoringLog).toEqual([
    // result of iteratively scoring tieMatchUps for roundNumber: 1, roundPosition: 1
    '1-0', '2-0', '3-0', '4-0', '5-0', '6-0', '7-0', '8-0', '9-0',
    // result of iteratively scoring tieMatchUps for roundNumber: 1, roundPosition: 2
    '9-0', '9-0', '9-0', '9-0', '9-0', '9-0', '9-0', '9-0', '9-0',
    // result of resetScoreCard
    '',
  ]);

  // check that after the calling resetScorecard all tieMatchUps have no score
  const finalTieMatchUpScores = firstMatchUpTieMatchUpScoringLog.pop();
  expect(finalTieMatchUpScores.filter(({ sets }) => sets)).toEqual([]);

  firstRoundDualMatchUps = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
  }).matchUps;

  targetMatchUp = firstRoundDualMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  expect(targetMatchUp.score.scoreStringSide1).toEqual();

  ({
    matchUps: [secondRoundDualMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [2],
    },
  }));
  // expect(secondRoundDualMatchUp.drawPositions).toEqual([undefined, 3]);
  expect(secondRoundDualMatchUp.drawPositions).toEqual([3]);
});
