import tieFormatDefaults from '../../../../tournamentEngine/generators/tieFormatDefaults';
import { compareTieFormats } from '../compareTieFormats';
import { it, expect } from 'vitest';

import { TieFormat } from '../../../../types/tournamentFromSchema';
import {
  COLLEGE_D3,
  COLLEGE_DEFAULT,
} from '../../../../constants/tieFormatConstants';

it('can find differences in tieFormats', () => {
  const descendant = tieFormatDefaults({ namedFormat: COLLEGE_DEFAULT });
  const ancestor = tieFormatDefaults({ namedFormat: COLLEGE_D3 });

  const result = compareTieFormats({ ancestor, descendant });
  expect(result.matchUpFormatDifferences).toEqual(['SET1-S:8/TB7@7']);
  expect(result.different).toEqual(true);
});

it('can differentiate matchUpValue', () => {
  const example = {
    modifiedTieFormat: {
      collectionDefinitions: [
        {
          matchUpValue: 0,
          matchUpType: 'DOUBLES',
          collectionName: 'Doubles',
          matchUpFormat: 'SET1-S:8/TB7',
          collectionId: 'collectionId001',
          matchUpCount: 1,
          collectionOrder: 1,
        },
        {
          matchUpValue: 0,
          matchUpType: 'SINGLES',
          collectionName: 'Singles',
          matchUpFormat: 'SET3-S:6/TB7-F:TB10',
          collectionId: 'collectionId002',
          matchUpCount: 2,
          collectionOrder: 2,
        },
      ],
      tieFormatName: 'DOMINANT_DUO',
      winCriteria: {
        aggregateValue: true,
      },
    },
    ancestor: {
      collectionDefinitions: [
        {
          collectionName: 'Doubles',
          matchUpCount: 1,
          matchUpFormat: 'SET1-S:8/TB7',
          matchUpType: 'DOUBLES',
          matchUpValue: 1,
          collectionId: 'collectionId001',
          collectionOrder: 1,
        },
        {
          collectionName: 'Singles',
          matchUpCount: 2,
          matchUpFormat: 'SET3-S:6/TB7-F:TB10',
          matchUpType: 'SINGLES',
          matchUpValue: 1,
          collectionId: 'collectionId002',
          collectionOrder: 2,
        },
      ],
      tieFormatName: 'DOMINANT_DUO',
      winCriteria: {
        valueGoal: 2,
      },
    },
  };

  const ancestor = example.ancestor as TieFormat;
  const descendant = example.modifiedTieFormat as TieFormat;
  const result = compareTieFormats({ ancestor, descendant });
  expect(Math.abs(result.valueDifference)).toEqual(3);
  expect(result.different).toEqual(true);
});
