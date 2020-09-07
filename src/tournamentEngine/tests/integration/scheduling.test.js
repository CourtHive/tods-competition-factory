import { tournamentEngine } from 'src/tournamentEngine';
import { competitionEngine } from 'src/competitionEngine';

import { matchUpTiming } from 'src/competitionEngine/governors/scheduleGovernor/garman/garman';
import { tournamentRecordWithParticipants } from 'src/tournamentEngine/tests/primitives';

import { SINGLES } from 'src/constants/eventConstants';
import { SUCCESS } from 'src/constants/resultConstants';

let result;

it('can add events, venues, and schedule matchUps', () => {
  let startDate = '2020-01-01';
  let endDate = '2020-01-06';
  let participantsCount = 32;

  let {
    tournamentRecord,
    participants
  } = tournamentRecordWithParticipants({ startDate, endDate, participantsCount });
  tournamentEngine.setState(tournamentRecord);

  let event = {
    eventName: 'Test Event',
    eventType: SINGLES
  };

  result = tournamentEngine.addEvent({ event });
  let { Event, success } = result;
  let { eventId } = Event;
  expect(success).toEqual(true);
 
  const participantIds = participants.map(p=>p.participantId);
  result = tournamentEngine.addEventEntries({eventId, participantIds});
  expect(result).toEqual(SUCCESS)

  let values = {
    automated: true,
    drawSize: 32,
    eventId,
    participants,
    event: Event
  }
  let { drawDefinition } = tournamentEngine.generateDrawDefinition(values);
  const { drawId } = drawDefinition;

  result = tournamentEngine.addDrawDefinition({eventId, drawDefinition});
  expect(result).toEqual(SUCCESS)

  let myCourts = { venueName: 'My Courts' }
  result = tournamentEngine.addVenue({venue: myCourts});
  let { venue: { venueId } } = result;
  expect(result.success).toEqual(true);

  let date = '2020-01-01';
  const dateAvailability = [
    {
      date, startTime: '07:00', endTime: '19:00',
      bookings: [
        { startTime: '7:00', endTime: '8:30', bookingType: 'PRACTICE'},
        { startTime: '8:30', endTime: '9:00', bookingType: 'MAINTENANCE'},
        { startTime: '13:30', endTime: '14:00', bookingType: 'MAINTENANCE'}
      ]
    }
  ];
  let { courts } = tournamentEngine.addCourts({venueId, courtsCount: 3, dateAvailability});
  expect(courts.length).toEqual(3);

  ({courts} = tournamentEngine.getCourts());
  expect(courts.length).toEqual(3);

  let { upcomingMatchUps, pendingMatchUps } = tournamentEngine.tournamentMatchUps();
  expect(upcomingMatchUps.length).toEqual(16);
  expect(pendingMatchUps.length).toEqual(15);

  let timingParameters = {
    date,
    courts,
    startTime: '8:00',
    endTime: ' 19:00',
    periodLength: 30,
    averageMatchTime: 90,
  }
  let { scheduleTimes } = matchUpTiming(timingParameters);
  expect(scheduleTimes.length).toEqual(19);

  tournamentRecord = tournamentEngine.getState();
  const { tournamentId } = tournamentRecord;
  let tournamentRecords = { [tournamentId]: tournamentRecord };

  result = competitionEngine
    .setState(tournamentRecords)
    .scheduleMatchUps({date, matchUps: upcomingMatchUps});
  expect(result).toEqual(SUCCESS);

  tournamentRecords = competitionEngine.getState();
  tournamentRecord = tournamentRecords[tournamentId];
  tournamentEngine.setState(tournamentRecord);

  const scheduledDate = '2020-01-01';
  let contextFilters = {
    eventIds: [],
    drawIds: [drawId],
    structureIds: [],
    roundNumbers: [1]
  };

  ({ upcomingMatchUps } = tournamentEngine.tournamentMatchUps({contextFilters}));
  expect(upcomingMatchUps.length).toEqual(16);
  
  contextFilters = { scheduledDate: '2020-01-02', };
  ({ upcomingMatchUps } = tournamentEngine.tournamentMatchUps({contextFilters}));
  expect(upcomingMatchUps.length).toEqual(0);

  let courtIds = courts.map(court => court.courtId);
  let courtId = courtIds[0];

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  let [matchUp] = matchUps;
  let { matchUpId } = matchUp;

  result = tournamentEngine.assignMatchUpCourt({matchUpId, courtId, drawId, courtDayDate: scheduledDate});
  expect(result).toEqual(SUCCESS);

  contextFilters = { courtIds };
  ({ matchUps } = tournamentEngine.allTournamentMatchUps({contextFilters}));
  expect(matchUps.length).toEqual(1);

  let { venues } = tournamentEngine.getVenues();
  expect(venues.length).toEqual(1);
  
  result = tournamentEngine.deleteVenue({venueId});
  expect(result).toEqual(SUCCESS);

  ({ venues } = tournamentEngine.getVenues());
  expect(venues.length).toEqual(0);
});
