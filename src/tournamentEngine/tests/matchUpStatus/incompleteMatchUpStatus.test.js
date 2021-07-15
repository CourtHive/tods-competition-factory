import {
  getContextMatchUp,
  getOrderedDrawPositionPairs,
} from '../../../drawEngine/tests/testingUtilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INCOMPLETE } from '../../../constants/matchUpStatusConstants';
import { INCOMPATIBLE_MATCHUP_STATUS } from '../../../constants/errorConditionConstants';

it('DISALLOWS entry of incomplete result if active downsream', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
        {
          roundNumber: 2,
          roundPosition: 1,
          scoreString: '6-2 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  const { matchUps } = tournamentEngine
    .setState(tournamentRecord)
    .allTournamentMatchUps();
  const { matchUp } = getContextMatchUp({
    matchUps,
    roundNumber: 1,
    roundPosition: 1,
  });
  const { drawId, matchUpId, structureId } = matchUp;

  const values = {
    scoreString: '6-1',
    matchUpStatus: INCOMPLETE,
  };
  const { outcome } = mocksEngine.generateOutcomeFromScoreString(values);
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.error).toEqual(INCOMPATIBLE_MATCHUP_STATUS);

  const { filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId });
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, 3],
    [],
    [1],
  ]);
});

it('removes advanced participant when completed score changes to incomplete result', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
        {
          roundNumber: 1,
          roundPosition: 2,
          scoreString: '6-1 6-2',
          winningSide: 1,
        },
      ],
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  let { matchUps } = tournamentEngine
    .setState(tournamentRecord)
    .allTournamentMatchUps();
  let { matchUp } = getContextMatchUp({
    matchUps,
    roundNumber: 1,
    roundPosition: 1,
  });
  const { drawId, matchUpId, structureId } = matchUp;

  const values = {
    scoreString: '6-1',
    matchUpStatus: INCOMPLETE,
  };
  const { outcome } = mocksEngine.generateOutcomeFromScoreString(values);
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  const { filteredOrderedPairs } = getOrderedDrawPositionPairs({ structureId });
  expect(filteredOrderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [3],
    [],
    [],
  ]);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  ({ matchUp } = getContextMatchUp({
    matchUps,
    roundNumber: 1,
    roundPosition: 1,
  }));
  expect(matchUp.score.scoreStringSide1).toEqual('6-1');
});

it('removes advanced participant in FINAL when completed score changes to incomplete result', () => {
  const drawProfiles = [
    {
      drawSize: 2,
      outcomes: [
        {
          roundNumber: 1,
          roundPosition: 1,
          scoreString: '6-1 6-1',
          winningSide: 1,
        },
      ],
    },
  ];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  let { matchUps } = tournamentEngine
    .setState(tournamentRecord)
    .allTournamentMatchUps();
  let { matchUp } = getContextMatchUp({
    matchUps,
    roundNumber: 1,
    roundPosition: 1,
  });
  const { drawId, matchUpId } = matchUp;

  const values = {
    scoreString: '6-1',
    matchUpStatus: INCOMPLETE,
  };
  const { outcome } = mocksEngine.generateOutcomeFromScoreString(values);
  let result = tournamentEngine.setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = tournamentEngine.allTournamentMatchUps());
  ({ matchUp } = getContextMatchUp({
    matchUps,
    roundNumber: 1,
    roundPosition: 1,
  }));
  expect(matchUp.score.scoreStringSide1).toEqual('6-1');
  expect(matchUp.winningSide).toBeUndefined();
});
