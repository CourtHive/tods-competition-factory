import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { USTA_GOLD_TEAM_CHALLENGE } from '../../../constants/tieFormatConstants';
import { COMPLETED } from '../../../constants/matchUpStatusConstants';
import { MAIN } from '../../../constants/drawDefinitionConstants';
import { TEAM } from '../../../constants/matchUpTypes';

// reusable
test('can clear TEAM matchUp "scorecards"', () => {
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
      contextFilters: {
        stages: [MAIN],
      },
      matchUpFilters: {
        matchUpTypes: [TEAM],
        roundNumbers: [1],
      },
    });

  expect(firstRoundDualMatchUps.length).toEqual(2);

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

  const matchUpId = firstRoundDualMatchUps[0].matchUpId;
  ({ matchUps: firstRoundDualMatchUps } =
    tournamentEngine.allTournamentMatchUps({
      contextFilters: {
        stages: [MAIN],
      },
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
    const { winningSide, matchUpStatus, score } = dualMatchUp;
    expect(matchUpStatus).toEqual(COMPLETED);
    expect(winningSide).toEqual(1);
    expect(score).toEqual({
      scoreStringSide1: '9-0',
      scoreStringSide2: '0-9',
      sets: [{ side1Score: 9, side2Score: 0 }],
    });
  });

  let {
    matchUps: [secondRoundDualMatchUp],
  } = tournamentEngine.allTournamentMatchUps({
    contextFilters: {
      stages: [MAIN],
    },
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [2],
    },
  });
  expect(secondRoundDualMatchUp.drawPositions).toEqual([1, 3]);

  let result = tournamentEngine.resetScorecard({
    matchUpId,
    drawId,
  });
  expect(result.success).toEqual(true);

  firstRoundDualMatchUps = tournamentEngine.allTournamentMatchUps({
    contextFilters: {
      stages: [MAIN],
    },
    matchUpFilters: {
      matchUpTypes: [TEAM],
      roundNumbers: [1],
    },
  }).matchUps;

  targetMatchUp = firstRoundDualMatchUps.find(
    (matchUp) => matchUp.matchUpId === matchUpId
  );

  expect(targetMatchUp.score).toBeUndefined();
});
