import { enterValues } from './primitives';

import { FORMAT_STANDARD_NOAD } from '../../../../../fixtures/scoring/matchUpFormats/formatConstants';

it('handles set tiebreak with NoAD', () => {
  const matchUpFormat = FORMAT_STANDARD_NOAD;
  let matchUp = { scoreString: undefined, sets: [], matchUpFormat };

  const values = [
    { lowSide: 2, value: '5' },
    { lowSide: 2, value: '5' },
  ];
  ({ matchUp } = enterValues({ values, matchUp }));
  expect(matchUp.scoreString.trim()).toEqual(`6-5 6-5`);

  expect(matchUp.sets.length).toEqual(2);
  expect(matchUp.winningSide).toEqual(1);
});
