import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import { UUID } from '../../utilities';

const namedFormats = {
  STANDARD: {
    doubles: { matchUpCount: 3, matchUpValue: 1 },
    singles: { matchUpCount: 6, matchUpValue: 1 },
    valueGoal: 5,
  },
  COLLEGE_D3: {
    doubles: {
      matchUpCount: 3,
      matchUpValue: 1,
      matchUpFormat: 'SET1-S:8/TB7@7',
    },
    singles: {
      matchUpCount: 6,
      matchUpValue: 1,
      matchUpFormat: 'SET3-S:6/TB7',
    },
    tieFormatName: 'COLLEGE_D3',
    valueGoal: 5,
  },
  COLLEGE_DEFAULT: {
    doubles: {
      matchUpCount: 3,
      collectionValue: 1,
      matchUpFormat: 'SET1-S:6NOAD/TB7',
    },
    singles: {
      matchUpCount: 6,
      matchUpValue: 1,
      matchUpFormat: 'SET3-S:6NOAD/TB7',
    },
    tieFormatName: 'COLLEGE_DEFAULT',
    valueGoal: 4,
  },
  COLLEGE_JUCO: {
    doubles: {
      matchUpCount: 3,
      matchUpValue: 1,
      matchUpFormat: 'SET1-S:8/TB7',
    },
    singles: {
      matchUpCount: 6,
      matchUpValue: 1,
      matchUpFormat: 'SET3-S:6',
    },
    tieFormatName: 'COLLEGE_JUCO',
    valueGoal: 5,
  },
};

export const tieFormatDefaults = ({ namedFormat, uuids = [] } = {}) => {
  if (!Object.keys(namedFormats).includes(namedFormat))
    namedFormat = 'STANDARD';
  if (!Array.isArray(uuids)) uuids = [];

  const template = namedFormats[namedFormat];

  const tieFormat = {
    winCriteria: {
      valueGoal: template.valueGoal,
    },
    collectionDefinitions: [
      {
        collectionId: uuids?.pop() || UUID(),
        collectionName: 'Doubles',
        matchUpType: DOUBLES,
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        ...template.doubles,
      },
      {
        collectionId: uuids?.pop() || UUID(),
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpFormat: 'SET3-S:6/TB7',
        ...template.singles,
      },
    ],
  };

  if (template.tieFormatName) tieFormat.tieFormatName = template.tieFormatName;

  return tieFormat;
};

export default tieFormatDefaults;
