import { CURTIS_CONSOLATION } from '../../../../constants/drawDefinitionConstants';
import { replacementTest } from '../../structures/byeReplacementStressTest';

test.skip.each([
  [8, CURTIS_CONSOLATION, [8, 7, 4, 6]],
  [16, CURTIS_CONSOLATION, [15, 16, 13, 7, 14, 11, 10, 12]],
  [
    32,
    CURTIS_CONSOLATION,
    [3, 18, 27, 8, 14, 28, 11, 1, 16, 25, 2, 26, 17, 10, 31, 6],
  ],
  [
    32,
    CURTIS_CONSOLATION,
    [1, 2, 3, 6, 8, 10, 11, 14, 16, 17, 18, 25, 26, 27, 28, 31],
  ],
])(
  'pass specific bye replaceent scenarios',
  (drawSize, drawType, positionsToReplaceWithBye) => {
    let result = replacementTest({
      drawType,
      drawSize,
      positionsToReplaceWithBye,
    });
    if (!result.success) {
      console.log('FAILED', { drawSize, drawType, positionsToReplaceWithBye });
    }
    expect(result.success).toEqual(true);
  }
);
