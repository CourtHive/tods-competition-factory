import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import { FORMAT_STANDARD } from '../../../../fixtures/scoring/matchUpFormats/formatConstants';
import { COMPASS } from '../../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../../constants/eventConstants';

it.skip('can clear scheduled matchUps', () => {
  const eventProfiles = [
    {
      eventName: 'Event Flights Test',
      eventType: SINGLES,
      category: {
        categoryName: 'U12',
      },
      matchUpFormat: FORMAT_STANDARD,
      drawProfiles: [
        {
          drawSize: 16,
        },
        {
          drawSize: 32,
          qualifyingPositions: 4,
          drawName: 'Main Draw',
          drawType: COMPASS,
        },
      ],
    },
  ];
  const {
    // eventIds: [eventId],
    // drawIds,
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
  });

  competitionEngine.setState(tournamentRecord);
});
