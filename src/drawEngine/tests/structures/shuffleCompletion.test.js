import { replacementTest } from './byeReplacementStressTest';

import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  MODIFIED_FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';

test.each([
  [16, COMPASS],
  [16, FIRST_MATCH_LOSER_CONSOLATION],
  [16, CURTIS_CONSOLATION],
  [16, MODIFIED_FEED_IN_CHAMPIONSHIP],
  [16, ROUND_ROBIN],
  [16, FEED_IN_CHAMPIONSHIP],
])('passes bye replacement tests for various values', (drawSize, drawType) => {
  let result = replacementTest({
    drawSize,
    drawType,
  });
  if (!result.success) {
    console.log('FAILED', { drawSize, drawType });
  }
  expect(result.success).toEqual(true);
});

test.each([
  [16, 8, COMPASS],
  [16, 8, ROUND_ROBIN],
  [16, 8, FIRST_MATCH_LOSER_CONSOLATION],
  [16, 8, CURTIS_CONSOLATION],
  [16, 8, MODIFIED_FEED_IN_CHAMPIONSHIP],
  [16, 8, FEED_IN_CHAMPIONSHIP],
])(
  'passes byeLimit tests for various values',
  (drawSize, byeLimit, drawType) => {
    let result = replacementTest({
      drawSize,
      byeLimit,
      drawType,
      devMode: true,
    });
    if (!result.success) {
      console.log('FAILED', { drawSize, byeLimit, drawType });
    }
    expect(result.success).toEqual(true);
  }
);
