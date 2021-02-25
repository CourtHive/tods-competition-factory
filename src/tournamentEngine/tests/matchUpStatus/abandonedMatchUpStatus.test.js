import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import { getOrderedDrawPositionPairs } from '../../../drawEngine/tests/testingUtilities';

import {
  ABANDONED,
  COMPLETED,
} from '../../../constants/matchUpStatusConstants';

it('can set matchUp score and advance winningSide when changing from ABANDONED matchUpStatus', () => {
  const drawProfiles = [
    {
      drawSize: 8,
    },
  ];
  const {
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({ drawProfiles });

  const { upcomingMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  const matchUpId = upcomingMatchUps[0].matchUpId;

  let result;
  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome: { matchUpStatus: ABANDONED },
  });
  expect(result.success).toEqual(true);

  const { matchUp } = tournamentEngine.findMatchUp({ drawId, matchUpId });
  expect(matchUp.matchUpStatus).toEqual(ABANDONED);

  const values = {
    scoreString: '6-1 6-1',
    winningSide: 1,
    matchUpStatus: COMPLETED,
  };
  const { outcome } = mocksEngine.generateOutcomeFromScoreString(values);
  // Object.assign(outcome, { matchUpStatus: COMPLETED });
  result = tournamentEngine.devContext(true).setMatchUpStatus({
    drawId,
    matchUpId,
    outcome,
  });
  expect(result.success).toEqual(true);

  const { completedMatchUps } = tournamentEngine.drawMatchUps({ drawId });
  expect(completedMatchUps[0].matchUpId).toEqual(matchUpId);

  const { orderedPairs } = getOrderedDrawPositionPairs();
  expect(orderedPairs).toEqual([
    [1, 2],
    [3, 4],
    [5, 6],
    [7, 8],
    [1, undefined],
    [undefined, undefined],
    [undefined, undefined],
  ]);
});
