import { makeDeepCopy, UUID } from '../../utilities';

import TEAM_AGGREGATION_TIE_FORMAT from '../../fixtures/scoring/tieFormats/TEAM_DOUBLES_3_AGGREGATION.json';
import DOMINANT_DUO_TIE_FORMAT from '../../fixtures/scoring/tieFormats/DOMINANT_DUO.json';
import DOMINANT_DUO_MIXED_TIE_FORMAT from '../../fixtures/scoring/tieFormats/DOMINANT_DUO_MIXED.json';
import USTA_BREWER_CUP_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_BREWER_CUP.json';
import USTA_OZAKI_CUP_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_OZAKI_CUP.json';
import USTA_GOLD_TEAM_CHALLENGE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_GOLD_TEAM_CHALLENGE.json';
import USTA_COLLEGE_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_COLLEGE.json';
import USTA_INTERSECTIONAL_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_INTERSECTIONAL.json';
import USTA_LEVEL_1_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_LEVEL_1.json';
import USTA_SOUTHERN_LEVEL_5_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_SOUTHERN_LEVEL_5.json';
import USTA_ITT_TOC_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_ITT_TOC.json';
import USTA_ZONAL_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_ZONAL.json';
import LAVER_CUP_TIE_FORMAT from '../../fixtures/scoring/tieFormats/LAVER_CUP.json';
import USTA_SECTION_BATTLE_TIE_FORMAT from '../../fixtures/scoring/tieFormats/USTA_SECTION_BATTLE.json';
import { DOUBLES, SINGLES } from '../../constants/matchUpTypes';
import {
  COLLEGE_D3,
  COLLEGE_DEFAULT,
  COLLEGE_JUCO,
  DOMINANT_DUO,
  DOMINANT_DUO_MIXED,
  LAVER_CUP,
  TEAM_DOUBLES_3_AGGREGATION,
  USTA_BREWER_CUP,
  USTA_OZAKI_CUP,
  USTA_COLLEGE,
  USTA_GOLD_TEAM_CHALLENGE,
  USTA_INTERSECTIONAL,
  USTA_ITT_TOC,
  USTA_LEVEL_1,
  USTA_SECTION_BATTLE,
  USTA_SOUTHERN_LEVEL_5,
  USTA_ZONAL,
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
  [DOMINANT_DUO_MIXED]: DOMINANT_DUO_MIXED_TIE_FORMAT,
  [TEAM_DOUBLES_3_AGGREGATION]: TEAM_AGGREGATION_TIE_FORMAT,
  [USTA_BREWER_CUP]: USTA_BREWER_CUP_TIE_FORMAT,
  [USTA_OZAKI_CUP]: USTA_OZAKI_CUP_TIE_FORMAT,
  [USTA_COLLEGE]: USTA_COLLEGE_TIE_FORMAT,
  [USTA_GOLD_TEAM_CHALLENGE]: USTA_GOLD_TEAM_CHALLENGE_FORMAT,
  [USTA_INTERSECTIONAL]: USTA_INTERSECTIONAL_TIE_FORMAT,
  [USTA_LEVEL_1]: USTA_LEVEL_1_TIE_FORMAT,
  [USTA_SECTION_BATTLE]: USTA_SECTION_BATTLE_TIE_FORMAT,
  [USTA_SOUTHERN_LEVEL_5]: USTA_SOUTHERN_LEVEL_5_TIE_FORMAT,
  [USTA_ITT_TOC]: USTA_ITT_TOC_TIE_FORMAT,
  [USTA_ZONAL]: USTA_ZONAL_TIE_FORMAT,
};

export const tieFormatDefaults = ({
  hydrateCollections,
  namedFormat,
  event = {},
  uuids = [],
} = {}) => {
  if (!Object.keys(namedFormats).includes(namedFormat))
    namedFormat = 'STANDARD';
  if (!Array.isArray(uuids)) uuids = [];

  let tieFormat;
  const { category, gender } = event;
  const template = makeDeepCopy(namedFormats[namedFormat], false, true);

  if (!template.hydrate) {
    template.collectionDefinitions.forEach(
      (collectionDefinition) => (collectionDefinition.collectionId = UUID())
    );
    tieFormat = template;
  } else {
    tieFormat = {
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

    if (template.tieFormatName)
      tieFormat.tieFormatName = template.tieFormatName;
  }

  if (hydrateCollections) {
    tieFormat.collectionDefinitions.forEach((collectionDefinition) => {
      if (category && !collectionDefinition.category)
        collectionDefinition.category = category;
      if (gender && !collectionDefinition.gender)
        collectionDefinition.gender = gender;
    });
  }

  return tieFormat;
};

export default tieFormatDefaults;
