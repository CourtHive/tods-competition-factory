import { validateTieFormat } from '../../../matchUpEngine/governors/tieFormatGovernor/tieFormatUtilities';
import tieFormatConstants from '../../../constants/tieFormatConstants';
import mocksEngine from '../../../mocksEngine';
import { tournamentEngine } from '../../..';
import { expect, it } from 'vitest';

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
  { key: tieFormatConstants.USTA_OZAKI_CUP, collectionsCount: 20 },
  { key: tieFormatConstants.USTA_COLLEGE, collectionsCount: 2 },
  { key: tieFormatConstants.USTA_GOLD_TEAM_CHALLENGE, collectionsCount: 5 },
  { key: tieFormatConstants.USTA_INTERSECTIONAL, collectionsCount: 5 },
  { key: tieFormatConstants.USTA_LEVEL_1, collectionsCount: 4 },
  { key: tieFormatConstants.USTA_SECTION_BATTLE, collectionsCount: 5 },
  { key: tieFormatConstants.USTA_SOUTHERN_LEVEL_5, collectionsCount: 3 },
  { key: tieFormatConstants.USTA_WTT_ITT_TOC, collectionsCount: 6 },
  { key: tieFormatConstants.USTA_ZONAL, collectionsCount: 5 },
];

it.each(tieKeys)('can generate all exported tieFormatConstants', (tieKey) => {
  const { key, collectionsCount, tieFormatName } = tieKey;
  const { eventIds, tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ eventType: TEAM, drawSize: 2, tieFormatName: key }],
    eventProfiles: [{ eventType: TEAM }],
  });

  tournamentEngine.setState(tournamentRecord);

  const tieFormat = tournamentRecord.events[0].tieFormat;

  let result = validateTieFormat({ tieFormat });
  expect(result.valid).toEqual(true);

  if (tieFormatName) {
    expect(tieFormat.tieFormatName).toEqual(tieFormatName);
  } else {
    expect(tieFormat.tieFormatName).toEqual(key);
  }
  expect(tieFormat.collectionDefinitions.length).toEqual(collectionsCount);

  const { tournamentParticipants } = tournamentEngine.getTournamentParticipants(
    {
      participantFilters: { participantTypes: [TEAM] },
    }
  );
  const participantIds = tournamentParticipants.map((p) => p.participantId);

  const eventId = eventIds[1];
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result.success).toEqual(true);

  result = tournamentEngine.generateDrawDefinition({
    tieFormatName: key,
    eventId,
  });
  expect(result.success).toEqual(true);

  const drawDefinition = result.drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result.success).toEqual(true);

  const { drawId } = drawDefinition;
  const { tieFormat: foundTieFormat } = tournamentEngine.getTieFormat({
    eventId,
    drawId,
  });
  if (tieFormatName) {
    expect(foundTieFormat.tieFormatName).toEqual(tieFormatName);
  } else {
    expect(foundTieFormat.tieFormatName).toEqual(key);
  }
});
