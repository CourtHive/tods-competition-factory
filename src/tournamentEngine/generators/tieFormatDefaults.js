import { UUID } from '../../utilities';

import TEAM_AGGREGATION_TIE_FORMAT from '../../fixtures/scoring/tieFormats/TEAM_DOUBLES_3_AGGREGATION.json';
import DOMINANT_DUO_TIE_FORMAT from '../../fixtures/scoring/tieFormats/DOMINANT_DUO.json';
import LAVER_CUP_TIE_FORMAT from '../../fixtures/scoring/tieFormats/LAVER_CUP.json';
import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import {
  COLLEGE_D3,
  COLLEGE_DEFAULT,
  COLLEGE_JUCO,
  DOMINANT_DUO,
  LAVER_CUP,
  TEAM_DOUBLES_3_AGGREGATION,
} from '../../constants/tieFormatConstants';

const namedFormats = {
  STANDARD: {
    hydrate: true,
    doubles: { matchUpCount: 3, matchUpValue: 1 },
    singles: { matchUpCount: 6, matchUpValue: 1 },
    valueGoal: 5,
  },
  [COLLEGE_D3]: {
    hydrate: true,
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
  [COLLEGE_DEFAULT]: {
    hydrate: true,
    doubles: {
      matchUpCount: 3,
      collectionValue: 1,
      matchUpFormat: 'SET1-S:6/TB7',
    },
    singles: {
      matchUpCount: 6,
      matchUpValue: 1,
      matchUpFormat: 'SET3-S:6/TB7',
    },
    tieFormatName: 'COLLEGE_DEFAULT',
    valueGoal: 4,
  },
  [COLLEGE_JUCO]: {
    hydrate: true,
    doubles: {
      matchUpCount: 3,
      matchUpValue: 1,
      matchUpFormat: 'SET1-S:8/TB7',
    },
    singles: {
      matchUpCount: 6,
      matchUpValue: 1,
      matchUpFormat: 'SET3-S:6/TB7',
    },
    tieFormatName: 'COLLEGE_JUCO',
    valueGoal: 5,
  },
  [LAVER_CUP]: LAVER_CUP_TIE_FORMAT,
  [DOMINANT_DUO]: DOMINANT_DUO_TIE_FORMAT,
  [TEAM_DOUBLES_3_AGGREGATION]: TEAM_AGGREGATION_TIE_FORMAT,
};

export const tieFormatDefaults = ({ namedFormat, uuids = [] } = {}) => {
  if (!Object.keys(namedFormats).includes(namedFormat))
    namedFormat = 'STANDARD';
  if (!Array.isArray(uuids)) uuids = [];

  const template = namedFormats[namedFormat];

  if (!template.hydrate) {
    template.collectionDefinitions.forEach(
      (collectionDefinition) => (collectionDefinition.collectionId = UUID())
    );
    return template;
  }

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
