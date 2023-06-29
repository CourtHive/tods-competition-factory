import tieFormatDefaults from '../../../../tournamentEngine/generators/tieFormatDefaults';
import { compareTieFormats } from '../compareTieFormats';
import { it, expect } from 'vitest';

import {
  COLLEGE_D3,
  COLLEGE_DEFAULT,
} from '../../../../constants/tieFormatConstants';

it('can find differences in tieFormats', () => {
  const ancestor = tieFormatDefaults({ namedFormat: COLLEGE_D3 });
  const descendant = tieFormatDefaults({ namedFormat: COLLEGE_DEFAULT });

  let result = compareTieFormats({ ancestor, descendant });
  expect(result.matchUpFormatDifferences).toEqual(['SET1-S:8/TB7@7']);
  expect(result.different).toEqual(true);
});
