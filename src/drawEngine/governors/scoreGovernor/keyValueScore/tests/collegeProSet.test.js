import { FORMAT_COLLEGE_PRO_SET } from './formatConstants';
import { enterValues } from './primitives';

it('support best of five sets with NO ADVANTAGE in Games', () => {
  const matchUpFormat = FORMAT_COLLEGE_PRO_SET;
  console.log({ matchUpFormat });
  let matchUp = { score: undefined, sets: [], matchUpFormat };

  const values = [{ lowSide: 2, value: '3' }];

  ({ matchUp } = enterValues({ values, matchUp }));
  /*
  expect(matchUp.score.trim()).toEqual(`5-3 3-5 5-3 3-5`);
  expect(matchUp.sets.length).toEqual(4);
  expect(matchUp.winningSide).toBeUndefined();

  ({ matchUp, message } = scoreMatchUp({ lowSide: 2, value: '3', matchUp}));
  expect(matchUp.score.trim()).toEqual(`5-3 3-5 5-3 3-5 5-3`);
  expect(matchUp.sets.length).toEqual(5);
  expect(matchUp.winningSide).toEqual(1);
  */
});
