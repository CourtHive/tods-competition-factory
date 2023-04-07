import { tournamentEngine, mocksEngine } from '../../..';
import { expect, it } from 'vitest';

import { INDIVIDUAL } from '../../../constants/participantConstants';
import { TEAM_EVENT } from '../../../constants/eventConstants';
import { RANKING } from '../../../constants/scaleConstants';
import { ASC } from '../../../constants/sortingConstants';

it('can generate lineUps for TEAM events', () => {
  let participantsCount = 100;

  const categoryName = '18U';
  const participantsProfile = {
    scaledParticipantsCount: participantsCount,
    category: { categoryName },
    participantsCount,
  };
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    tournamentName: 'Dominant Duo',
    participantsProfile,
    drawProfiles: [
      {
        category: { ageCategoryCode: categoryName },
        tieFormatName: 'DOMINANT_DUO',
        eventType: TEAM_EVENT,
        drawSize: 8,
      },
    ],
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);

  const { participants } = tournamentEngine.getParticipants({
    participantFilters: { participantTypes: [INDIVIDUAL] },
    withScaleValues: true,
  });

  expect(participants.every((p) => p.rankings?.SINGLES.length)).toEqual(true);

  const scaleAccessor = {
    scaleName: categoryName,
    scaleType: RANKING,
    sortOrder: ASC,
  };
  result = tournamentEngine.generateLineUps({
    singlesOnly: true,
    scaleAccessor,
    drawId,
  });

  // TODO: for DOUBLES collectionPositions need to have two participants assigned to them
});
