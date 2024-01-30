import { checkSetIsComplete } from '@Query/matchUp/checkSetIsComplete';
import { expect, it } from 'vitest';

it('properly determines when sets are complete', () => {
  let matchUpFormat = 'SET3-S:4/TB7-F:TB7';
  let params: any = {
    matchUpFormat,
    set: {
      side1Score: 4,
      side2Score: 3,
    },
  };
  let result = checkSetIsComplete(params);
  expect(result).toEqual(false);

  matchUpFormat = 'SET3-S:4NOAD-F:TB7';
  params = {
    matchUpFormat,
    set: {
      side1Score: 4,
      side2Score: 3,
    },
  };
  result = checkSetIsComplete(params);
  expect(result).toEqual(true);
});
