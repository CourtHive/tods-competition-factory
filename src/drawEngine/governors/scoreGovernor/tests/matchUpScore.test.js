import { matchUpScore } from '../matchUpScore';

import { COMPLETED } from '../../../../constants/matchUpStatusConstants';

it('can generate score object', () => {
  const sets = [
    { setNumber: 1, side1Score: 6, side2Score: 2, winningSide: 1 },
    { setNumber: 2, side1Score: 1, side2Score: 6, winningSide: 2 },
    { setNumber: 3, side1Score: 1, side2Score: 6, winningSide: 2 },
  ];
  const { score } = matchUpScore({
    score: { sets },
    winningSide: 2,
    matchUpStatus: COMPLETED,
  });

  expect(score.scoreStringSide1).toEqual('6-2 1-6 1-6');
  expect(score.scoreStringSide2).toEqual('2-6 6-1 6-1');
});
