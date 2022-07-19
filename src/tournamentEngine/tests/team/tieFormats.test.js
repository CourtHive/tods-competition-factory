import tieFormatConstants from '../../../constants/tieFormatConstants';
import mocksEngine from '../../../mocksEngine';

import { TEAM } from '../../../constants/eventConstants';

const tieKeys = [
  { key: tieFormatConstants.COLLEGE_D3, collectionsCount: 2 },
  { key: tieFormatConstants.COLLEGE_DEFAULT, collectionsCount: 2 },
  { key: tieFormatConstants.COLLEGE_JUCO, collectionsCount: 2 },
  { key: tieFormatConstants.DOMINANT_DUO, collectionsCount: 2 },
  { key: tieFormatConstants.DOMINANT_DUO_MIXED, collectionsCount: 3 },
  { key: tieFormatConstants.LAVER_CUP, collectionsCount: 6 },
  {
    key: tieFormatConstants.TEAM_DOUBLES_3_AGGREGATION,
    tieFormatName: 'Doubles Shuffle',
    collectionsCount: 3,
  },
  { key: tieFormatConstants.USTA_BREWER_CUP, collectionsCount: 6 },
  { key: tieFormatConstants.USTA_COLLEGE, collectionsCount: 2 },
  { key: tieFormatConstants.USTA_GOLD_TEAM_CHALLENGE, collectionsCount: 5 },
  { key: tieFormatConstants.USTA_INTERSECTIONAL, collectionsCount: 5 },
  { key: tieFormatConstants.USTA_LEVEL_1, collectionsCount: 4 },
  { key: tieFormatConstants.USTA_SECTION_BATTLE, collectionsCount: 5 },
  { key: tieFormatConstants.USTA_SOUTHERN_LEVEL_5, collectionsCount: 3 },
  { key: tieFormatConstants.USTA_WTT, collectionsCount: 5 },
  { key: tieFormatConstants.USTA_ZONAL, collectionsCount: 5 },
];

it.each(tieKeys)('can generate all exported tieFormatConstants', (tieKey) => {
  const { key, collectionsCount, tieFormatName } = tieKey;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: TEAM, drawSize: 2, tieFormatName: key }],
  });

  const tieFormat = tournamentRecord.events[0].tieFormat;

  if (tieFormatName) {
    expect(tieFormat.tieFormatName).toEqual(tieFormatName);
  } else {
    expect(tieFormat.tieFormatName).toEqual(key);
  }
  expect(tieFormat.collectionDefinitions.length).toEqual(collectionsCount);
});
