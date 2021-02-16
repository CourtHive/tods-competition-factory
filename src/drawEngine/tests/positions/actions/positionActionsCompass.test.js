import { replacementTest } from '../../structures/byeReplacementStressTest';
import { COMPASS } from '../../../../constants/drawDefinitionConstants';

test.each([
  [16, COMPASS, [8, 6, 15, 3, 11, 10, 5, 4]],
  [8, COMPASS, [6, 1, 2, 7]],
  // [8, COMPASS, [7, 8, 5, 4]],
  // [8, COMPASS, [5, 6, 3, 1]],
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
