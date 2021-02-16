import { replacementTest } from './byeReplacementStressTest';

import {
  COMPASS,
  CURTIS_CONSOLATION,
  FEED_IN_CHAMPIONSHIP,
  FIRST_MATCH_LOSER_CONSOLATION,
  MODIFIED_FEED_IN_CHAMPIONSHIP,
  ROUND_ROBIN,
} from '../../../constants/drawDefinitionConstants';

/*
PASSED: FEED_IN_CHAMPIONSHIP 16 * 100
PASSED: FEED_IN_CHAMPIONSHIP 32 * 100
PASSED: MODIFIED_FEED_IN_CHAMPIONSHIP 32 * 100
PASSED: CURTIS_CONSOLATION 32 * 100
PASSED: ROUND_ROBIN 32 * 100
PASSED: COMPASS 32 * 100
PASSED: COMPASS 64 * 10
PASSED: FMLC 8 * 100
PASSED: FMLC 16 * 100
PASSED: FMLC 32 * 100
PASSED: FMLC 64 * 10
*/

it('can randomize drawPositions, randomize replacements, and complete various drawTypes', () => {
  let result = replacementTest({
    drawType: COMPASS,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: CURTIS_CONSOLATION,
    drawSize: 32,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: MODIFIED_FEED_IN_CHAMPIONSHIP,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: ROUND_ROBIN,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: FEED_IN_CHAMPIONSHIP,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
});

it('can pass COMPASS replacement test', () => {
  let result = replacementTest({
    drawType: COMPASS,
    drawSize: 16,
    positionsToReplaceWithBye: [8, 6, 15, 3, 11, 10, 5, 4],
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    drawType: COMPASS,
    drawSize: 8,
    positionsToReplaceWithBye: [6, 1, 2, 7],
  });
  expect(result.success).toEqual(true);
});

it('BYELIMIT: can randomize drawPositions, randomize replacements, and complete various drawTypes', () => {
  let result = replacementTest({
    byeLimit: 8,
    drawType: COMPASS,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    byeLimit: 8,
    drawType: FIRST_MATCH_LOSER_CONSOLATION,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    byeLimit: 8,
    drawType: CURTIS_CONSOLATION,
    drawSize: 32,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    byeLimit: 8,
    drawType: MODIFIED_FEED_IN_CHAMPIONSHIP,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    byeLimit: 8,
    drawType: ROUND_ROBIN,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
  result = replacementTest({
    byeLimit: 8,
    drawType: FEED_IN_CHAMPIONSHIP,
    drawSize: 16,
  });
  expect(result.success).toEqual(true);
});
