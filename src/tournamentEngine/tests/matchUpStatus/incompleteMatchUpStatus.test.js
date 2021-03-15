import {
  getContextMatchUp,
  getOrderedDrawPositionPairs,
} from '../../../drawEngine/tests/testingUtilities';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { INCOMPLETE } from '../../../constants/matchUpStatusConstants';

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
  mocksEngine.generateTournamentRecord({ drawProfiles });

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  const { matchUp } = getContextMatchUp({
    matchUps,
    roundNumber: 1,
    roundPosition: 1,
  });
  const { drawId, matchUpId, structureId } = matchUp;

  const values = {
    scoreString: '6-1',
    winningSide: 1,
    matchUpStatus: INCOMPLETE,
  };
  const { outcome } = mocksEngine.generateOutcomeFromScoreString(values);
  let result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.error).not.toBeUndefined();

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
