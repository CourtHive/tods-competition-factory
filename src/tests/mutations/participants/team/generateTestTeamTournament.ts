import mocksEngine from '@Assemblies/engines/mock';
import { generateRange } from '@Tools/arrays';

import { SINGLE_ELIMINATION } from '@Constants/drawDefinitionConstants';
import { DOUBLES, SINGLES } from '@Constants/matchUpTypes';
import { TEAM_EVENT } from '@Constants/eventConstants';
import { FORMAT_ATP_DOUBLES, FORMAT_STANDARD } from '@Fixtures/scoring/matchUpFormats';

export function generateTeamTournament(params?) {
  const {
    drawType = SINGLE_ELIMINATION,
    drawProfilesCount = 1,
    doublesCount = 1,
    singlesCount = 2,
    drawSize = 8,
  } = params || {};
  const valueGoal = Math.ceil((doublesCount + singlesCount) / 2);
  const tieFormat = {
    winCriteria: { valueGoal },
    collectionDefinitions: [
      {
        collectionId: 'doublesCollectionId',
        matchUpFormat: FORMAT_ATP_DOUBLES,
        matchUpCount: doublesCount,
        collectionName: 'Doubles',
        matchUpType: DOUBLES,
        matchUpValue: 1,
      },
      {
        collectionId: 'singlesCollectionId',
        matchUpFormat: FORMAT_STANDARD,
        matchUpCount: singlesCount,
        collectionName: 'Singles',
        matchUpType: SINGLES,
        matchUpValue: 1,
      },
    ],
  };

  const drawProfiles = generateRange(0, drawProfilesCount).map((i) => ({
    drawName: `Main Draw ${i + 1}`,
    tieFormat,
    drawType,
    drawSize,
  }));

  const eventProfiles = [
    {
      eventName: 'Test Team Event',
      eventType: TEAM_EVENT,
      drawProfiles,
      tieFormat,
    },
  ];

  const {
    drawIds,
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsProfile: { idPrefix: 'xxx' },
    eventProfiles,
  });

  const [drawId] = drawIds;

  return { tournamentRecord, eventId, drawId, drawIds, valueGoal };
}
