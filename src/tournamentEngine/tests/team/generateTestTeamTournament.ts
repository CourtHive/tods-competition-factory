import { generateRange } from '../../../utilities';
import { mocksEngine } from '../../..';

import { SINGLE_ELIMINATION } from '../../../constants/drawDefinitionConstants';
import { TypeEnum } from '../../../types/tournamentFromSchema';

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
        matchUpFormat: 'SET3-S:6/TB7-F:TB10',
        matchUpType: TypeEnum.Doubles,
        matchUpCount: doublesCount,
        collectionName: 'Doubles',
        matchUpValue: 1,
      },
      {
        collectionId: 'singlesCollectionId',
        matchUpFormat: 'SET3-S:6/TB7',
        matchUpType: TypeEnum.Singles,
        matchUpCount: singlesCount,
        collectionName: 'Singles',
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
      eventType: TypeEnum.Team,
      drawProfiles,
      tieFormat,
    },
  ];

  const {
    drawIds,
    eventIds: [eventId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({ eventProfiles });

  const [drawId] = drawIds;

  return { tournamentRecord, eventId, drawId, drawIds, valueGoal };
}
