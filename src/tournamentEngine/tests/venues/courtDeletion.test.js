import { tournamentEngine } from '../..';
import { generateTournamentWithParticipants } from '../../../mocksEngine/generators/generateTournamentWithParticipants';

import { SINGLES } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';

it('can add events, venues, and schedule matchUps', () => {
  const startDate = '2020-01-01';
  const endDate = '2020-01-06';
  const participantsCount = 32;

  const { tournamentRecord: record } = generateTournamentWithParticipants({
    startDate,
    endDate,
    participantsCount,
  });
  const { participants } = record;
  tournamentEngine.setState(record);

  const event = {
    eventName: 'Test Event',
    eventType: SINGLES,
  };

  let result = tournamentEngine.addEvent({ event });
  const { event: eventResult, success } = result;
  const { eventId } = eventResult;
  expect(success).toEqual(true);

  const participantIds = participants.map((p) => p.participantId);
  result = tournamentEngine.addEventEntries({ eventId, participantIds });
  expect(result).toEqual(SUCCESS);

  const values = {
    automated: true,
    drawSize: 32,
    eventId,
    participants,
    event: eventResult,
  };
  const { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({ eventId, drawDefinition });
  expect(result).toEqual(SUCCESS);

  const myCourts = { venueName: 'My Courts' };
  result = tournamentEngine.addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const date = '2020-01-01T00:00';
  const dateAvailability = [
    {
      date,
      startTime: '07:00',
      endTime: '19:00',
    },
  ];
  let { courts } = tournamentEngine.addCourts({
    venueId,
    courtsCount: 3,
    dateAvailability,
  });
  expect(courts.length).toEqual(3);

  ({ courts } = tournamentEngine.getCourts());
  expect(courts.length).toEqual(3);

  const { tournamentRecord } = tournamentEngine.getState();
  expect(tournamentRecord.venues.length).toEqual(1);

  const {
    upcomingMatchUps: upcoming,
    pendingMatchUps,
  } = tournamentEngine.tournamentMatchUps();
  expect(upcoming.length).toEqual(16);
  expect(pendingMatchUps.length).toEqual(15);

  const scheduledDate = '2020-01-01';
  let contextFilters = {
    eventIds: [],
    drawIds: [drawId],
    structureIds: [],
    roundNumbers: [1],
  };

  let { upcomingMatchUps } = tournamentEngine.tournamentMatchUps({
    contextFilters,
  });
  expect(upcomingMatchUps.length).toEqual(16);

  contextFilters = { scheduledDate: '2020-01-02' };
  ({ upcomingMatchUps } = tournamentEngine.tournamentMatchUps({
    contextFilters,
  }));
  expect(upcomingMatchUps.length).toEqual(0);

  const courtIds = courts.map((court) => court.courtId);
  const courtId = courtIds[0];

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  const [matchUp] = matchUps;
  const { matchUpId } = matchUp;

  result = tournamentEngine.assignMatchUpVenue({
    matchUpId,
    venueId,
    drawId,
  });
  expect(result).toEqual(SUCCESS);

  result = tournamentEngine.assignMatchUpCourt({
    tournamentRecord,
    matchUpId,
    courtId,
    drawId,
    courtDayDate: scheduledDate,
  });
  expect(result).toEqual(SUCCESS);

  const scheduledDayDate = '2020-01-03T00:00';
  result = tournamentEngine.addMatchUpScheduledDayDate({
    drawId,
    matchUpId,
    scheduledDayDate,
  });
  expect(result).toEqual(SUCCESS);

  const scheduledTime = '2020-01-03T13:00';
  result = tournamentEngine.addMatchUpScheduledTime({
    drawId,
    matchUpId,
    scheduledTime,
  });
  expect(result).toEqual(SUCCESS);

  contextFilters = { courtIds };
  ({ matchUps } = tournamentEngine.allTournamentMatchUps({ contextFilters }));
  expect(matchUps.length).toEqual(1);
  expect(matchUps[0].schedule.courtId).toEqual(courtId);
  expect(matchUps[0].schedule.scheduledDate).toEqual(scheduledDayDate);
  expect(matchUps[0].schedule.scheduledTime).toEqual(scheduledTime);

  const venueName = 'New venue name';
  const venueAbbreviation = 'NVN';
  const modifications = {
    venueName,
    venueAbbreviation,
    courts: [
      {
        courtId: 'b9df6177-e430-4a70-ba47-9b9ff60258cb',
        courtName: 'Custom Court 1',
        dateAvailability: [
          {
            date: '2020-01-01',
            startTime: '16:30',
            endTime: '17:30',
          },
          {
            date: '2020-01-02',
            startTime: '16:30',
            endTime: '17:30',
          },
        ],
      },
    ],
  };

  result = tournamentEngine.modifyVenue({ venueId, modifications });
  expect(result.error.errors.length).toEqual(1);

  result = tournamentEngine.modifyVenue({
    venueId,
    modifications,
    force: true,
  });
  expect(result.success).toEqual(true);
});
