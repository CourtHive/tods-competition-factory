import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import { TEAM } from '../../../constants/matchUpTypes';

it('can generate draws in TEAM events with tieFormat', () => {
  const eventProfiles = [
    {
      eventName: 'Test Team Event',
      eventType: TEAM,
      category: {
        categoryName: 'U12',
      },
      drawProfiles: [
        {
          drawSize: 32,
          drawName: 'Main Draw',
        },
      ],
    },
  ];

  const participantsProfile = {
    participantsCount: 100,
    nationalityCodesCount: 10,
  };

  const {
    eventIds: [eventId],
    drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    participantsProfile,
    eventProfiles,
  });
  expect(eventId).not.toBeUndefined();
  expect(drawId).not.toBeUndefined();

  tournamentEngine.setState(tournamentRecord);

  const { matchUps } = tournamentEngine.allTournamentMatchUps();
  // 31 matchUps and 279 tieMatchUps = 310
  expect(matchUps.length).toEqual(310);

  const { pendingMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(pendingMatchUps.length).toEqual(310);
});

it('can generate drawDefinition for TEAM event', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    startDate: '2020-01-01',
    endDate: '2020-01-06',
  });

  tournamentEngine.setState(tournamentRecord);

  const eventName = 'Test Event';
  const event = {
    eventName,
    eventType: TEAM,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  /*
  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);
  */

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    event: eventResult,
    matchUpType: TEAM,
  };
  tournamentEngine.generateDrawDefinition(values);
});
