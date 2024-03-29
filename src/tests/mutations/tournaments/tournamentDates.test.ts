import { setSubscriptions } from '@Global/state/globalState';
import { addDays, extractDate } from '@Tools/dateTime';
import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import { expect, it } from 'vitest';

// constants
import { MODIFY_DRAW_DEFINITION, MODIFY_MATCHUP } from '@Constants/topicConstants';
import { INVALID_DATE, INVALID_VALUES } from '@Constants/errorConditionConstants';
import { MON } from '@Constants/weekdayConstants';

it('will remove court.dateAvailabiilty items that fall outside of tournament dates', () => {
  const venueId = 'venueId';
  const venue = {
    venueName: 'City Courts',
    venueAbbreviation: 'CC',
    venueId,
    courts: [
      {
        courtName: 'Court 1',
        dateAvailability: [
          {
            startTime: '18:00',
            endTime: '22:00',
          },
          {
            date: '2022-09-24T00:00:00.000Z',
            startTime: '08:00',
            endTime: '18:00',
          },
          {
            date: '2022-09-25T00:00:00.000Z',
            startTime: '08:00',
            endTime: '18:00',
          },
          {
            date: '2022-09-26T00:00:00.000Z',
            startTime: '18:00',
            endTime: '22:00',
          },
          {
            date: '2022-09-27T00:00:00.000Z',
            startTime: '18:00',
            endTime: '22:00',
          },
          {
            date: '2022-09-28T00:00:00.000Z',
            startTime: '18:00',
            endTime: '22:00',
          },
        ],
        onlineResources: [],
      },
    ],
  };
  const startDate = '2022-09-24T00:00:00.000Z';
  const endDate = '2022-09-28T00:00:00.000Z';

  const drawSize = 2;
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize }],
    startDate,
    endDate,
  });

  let result = tournamentEngine.setState(tournamentRecord);
  expect(result.success).toEqual(true);
  result = tournamentEngine.addVenue({ venue });
  expect(result.success).toEqual(true);

  result = tournamentEngine.findVenue({ venueId });
  expect(result.venue.courts[0].dateAvailability.length).toEqual(6);

  result = tournamentEngine.setTournamentDates({ startDate: '2022-09-26' });
  expect(result.datesRemoved).toEqual(['2022-09-24', '2022-09-25']);
  expect(result.success).toEqual(true);

  result = tournamentEngine.findVenue({ venueId });
  expect(result.venue.courts[0].dateAvailability.length).toEqual(4);

  result = tournamentEngine.setTournamentDates({ endDate: '2022-09-27' });
  expect(result.datesRemoved).toEqual(['2022-09-28']);
  expect(result.success).toEqual(true);

  result = tournamentEngine.findVenue({ venueId });
  expect(result.venue.courts[0].dateAvailability.length).toEqual(3);
});

it('will remove scheduling detail for matchUps which have been scheduled outside of tournament dates', () => {
  const eventId = 'eventId';
  const venueId = 'venueId';
  const drawId = 'drawId';

  const drawProfiles = [{ idPrefix: 'm', drawId, eventId, drawSize: 64 }];
  const startDate = extractDate(new Date().toISOString());
  const endDate = addDays(startDate, 2);
  const startTime = '08:00';
  const endTime = '21:00';

  const venueProfiles = [
    {
      courtNames: ['One', 'Two', 'Three'],
      courtIds: ['c1', 'c2', 'c3'],
      venueAbbreviation: 'VNU',
      venueName: 'Venue',
      courtsCount: 4,
      startTime,
      endTime,
      venueId,
    },
  ];

  const schedulingProfile = [
    {
      venues: [{ venueId, rounds: [{ drawId, roundNumber: 1 }] }],
      scheduleDate: startDate,
    },
    {
      venues: [{ venueId, rounds: [{ drawId, roundNumber: 2 }] }],
      scheduleDate: addDays(startDate, 1),
    },
    {
      venues: [
        {
          venueId,
          rounds: [
            { drawId, roundNumber: 3 },
            { drawId, roundNumber: 4 },
          ],
        },
      ],
      scheduleDate: addDays(startDate, 2),
    },
  ];
  const { schedulerResult } = mocksEngine.generateTournamentRecord({
    autoSchedule: true,
    schedulingProfile,
    setState: true,
    venueProfiles,
    drawProfiles,
    startDate,
    endDate,
  });

  expect(Object.values(schedulerResult.matchUpScheduleTimes).length).toEqual(60);

  const matchUpModifyNotices: any[] = [];
  const drawModifyNotices: any[] = [];

  const subscriptions = {
    [MODIFY_MATCHUP]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ matchUp }) => {
          matchUpModifyNotices.push(matchUp);
        });
      }
    },
    [MODIFY_DRAW_DEFINITION]: (payload) => {
      if (Array.isArray(payload)) {
        payload.forEach(({ drawDefinition }) => {
          drawModifyNotices.push(drawDefinition);
        });
      }
    },
  };

  setSubscriptions({ subscriptions });
  expect(matchUpModifyNotices.length).toEqual(0);
  let result = tournamentEngine.setTournamentDates({ endDate: addDays(startDate, 1) });
  expect(result.unscheduledMatchUpIds).toEqual(schedulerResult.scheduledMatchUpIds[result.datesRemoved[0]]);
  expect(result.unscheduledMatchUpIds.length).toEqual(12);
  expect(matchUpModifyNotices.length).toEqual(12);
  expect(result.datesRemoved.length).toEqual(1);
  expect(result.success).toEqual(true);

  result = tournamentEngine.setTournamentDates({ endDate: startDate });
  expect(result.unscheduledMatchUpIds).toEqual(schedulerResult.scheduledMatchUpIds[result.datesRemoved[0]]);
  expect(result.unscheduledMatchUpIds.length).toEqual(16);
  expect(matchUpModifyNotices.length).toEqual(28);
  expect(result.datesRemoved.length).toEqual(1);

  result = tournamentEngine.setTournamentDates({ endDate: addDays(startDate, 2) });
  expect(result.datesAdded.length).toEqual(2);

  result = tournamentEngine.setTournamentDates({ startDate: addDays(startDate, -1) });
  expect(result.datesAdded.length).toEqual(1);

  result = tournamentEngine.getTournamentInfo();
  expect(result.tournamentInfo.startDate).toEqual(addDays(startDate, -1));
  expect(result.tournamentInfo.endDate).toEqual(endDate);
  const eventInfo = result.tournamentInfo.eventInfo.find((info) => info.eventId === eventId);
  // expect the event start and end dates to be equivalent because they were changed when the tournament dates were reduced
  expect(eventInfo.startDate).toEqual(startDate);
  expect(eventInfo.endDate).toEqual(startDate);

  // the event was not published so it should not appear when usePublishState is true
  result = tournamentEngine.getTournamentInfo({ usePublishState: true });
  expect(result.tournamentInfo.eventInfo).toEqual([]);

  result = tournamentEngine.publishEvent({ eventId });
  expect(result.success).toEqual(true);
  // eventInfo appears when event is published and usePublishState is true
  result = tournamentEngine.getTournamentInfo({ usePublishState: true });
  expect(result.tournamentInfo.eventInfo.length).toEqual(1);

  // since notices were not cleared between "transactions" there will be one for each date change
  expect(drawModifyNotices.length).toEqual(2);
});

it('can set activeDates for a tournament', () => {
  const startDate = '2024-05-01';
  const endDate = addDays(startDate, 6);
  mocksEngine.generateTournamentRecord({ startDate, endDate, setState: true });

  // first date is before startDate
  let activeDates = [addDays(startDate, -1), addDays(startDate, 2), addDays(startDate, 4)];
  let result = tournamentEngine.setTournamentDates({ activeDates });
  expect(result.error).toEqual(INVALID_DATE);

  // last date is after endDate
  activeDates = [startDate, addDays(startDate, 2), addDays(startDate, 7)];
  result = tournamentEngine.setTournamentDates({ activeDates });
  expect(result.error).toEqual(INVALID_DATE);

  activeDates = [startDate, addDays(startDate, 2), addDays(startDate, 4)];
  result = tournamentEngine.setTournamentDates({ activeDates });
  expect(result.success).toEqual(true);
});

it('can set weekdays for a tournament', () => {
  mocksEngine.generateTournamentRecord({ setState: true });
  let result = tournamentEngine.setTournamentDates({ weekdays: true });
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setTournamentDates({ weekdays: ['Invalid'] });
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setTournamentDates({ weekdays: [MON, MON] }); // duplicate values
  expect(result.error).toEqual(INVALID_VALUES);
  result = tournamentEngine.setTournamentDates({ weekdays: [MON] });
  expect(result.success).toEqual(true);
});
