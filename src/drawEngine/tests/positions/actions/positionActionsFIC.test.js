import { replacementTest } from '../../structures/byeReplacementStressTest';
import { FEED_IN_CHAMPIONSHIP } from '../../../../constants/drawDefinitionConstants';

test.each([
  [8, FEED_IN_CHAMPIONSHIP, [2, 4, 5, 6]],
  [8, FEED_IN_CHAMPIONSHIP, [7, 5, 6, 8]],
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
