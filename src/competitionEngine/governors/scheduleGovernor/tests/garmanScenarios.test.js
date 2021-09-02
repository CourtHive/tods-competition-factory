import { BYE } from '../../../../constants/matchUpStatusConstants';
import POLICY_SCHEDULING_USTA from '../../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { generateRange, unique } from '../../../../utilities';
import { extractTime } from '../../../../utilities/dateTime';
import competitionEngine from '../../../sync';
import garman from '../garman/garman';

const date = new Date().toISOString().split('T')[0];

function courtGenerator({
  count = 10,
  startTime = '8:00',
  endTime = '20:30',
} = {}) {
  return generateRange(0, count).map(() => ({
    dateAvailability: [{ date, startTime, endTime }],
  }));
}

it('correctly generates second round scheduleTimes', () => {
  const courtsCount = 30;
  const courts = courtGenerator({
    count: courtsCount,
    startTime: '08:00',
    endTime: '21:00',
  });
  const { scheduleTimes, timingProfile } = garman.getScheduleTimes({
    startTime: '08:00',
    endTime: '21:00',
    date,
    periodLength: 30,
    averageMatchUpMinutes: 90,
    courts,
  });

  const allScheduleTimes = scheduleTimes.reduce(
    (timesMapped, { scheduleTime }) => {
      if (!timesMapped[scheduleTime]) {
        timesMapped[scheduleTime] = 1;
      } else {
        timesMapped[scheduleTime] += 1;
      }
      return timesMapped;
    },
    {}
  );

  // the incidence of the first schedule time is equivalent to the total number of courts
  expect(allScheduleTimes['08:00']).toEqual(courtsCount);
  // every other schedule time has 10 instances
  expect(unique(Object.values(allScheduleTimes).slice(1))).toEqual([10]);

  // the first two periods are equal to the number of courts
  // after the first two periods 10 matchUps are added per period until the end of the avialble court time
  // ... after which it is unchanging
  expect(timingProfile.map(({ totalMatchUps }) => totalMatchUps)).toEqual([
    30, 30, 40, 50, 60, 70, 80, 90, 100, 110, 120, 130, 140, 150, 160, 170, 180,
    190, 200, 210, 220, 230, 240, 250, 250, 250, 250,
  ]);

  // from 08:00 until 21:00 there are 26 periods of 30 minutes
  // since averageMatchUpMinutes is 90, matchUps cannot be scheduled after 19:30
  // ... which means 24 of the 26 periods can be scheduled
  // given that the second period cannot be scheduled due to averageMatchUpMinutes
  // ... there are 23 periods which can be scheduled
  // we expect that the unique number of totalMatchUps values will be 23
  expect(
    unique(timingProfile.map(({ totalMatchUps }) => totalMatchUps)).length
  );
});

it('properly schedules 2nd round of 128 single elimination draw with 30 courts', () => {
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';

  const courtsCount = 30;
  const startTime = '08:00';
  const endTime = '21:00';

  const venueProfiles = [
    {
      venueName: 'Very Large Venue',
      venueAbbreviation: 'VLV',
      courtsCount,
      startTime,
      endTime,
    },
  ];

  const eventProfiles = [
    {
      eventName: 'Scheduling Test',
      drawProfiles: [
        {
          drawSize: 128,
          participantsCount: 127,
        },
      ],
    },
  ];
  const {
    drawIds: [drawId],
    eventIds: [eventId],
    venueIds: [venueId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    policyDefinitions: POLICY_SCHEDULING_USTA,
    eventProfiles,
    venueProfiles,
    startDate,
    endDate,
  });

  const { tournamentId } = tournamentRecord;
  competitionEngine.setState(tournamentRecord);

  const {
    drawDefinition: {
      structures: [{ structureId }],
    },
  } = tournamentEngine.getEvent({ drawId });
  let result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId,
    round: { tournamentId, eventId, drawId, structureId, roundNumber: 1 },
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId,
    round: { tournamentId, eventId, drawId, structureId, roundNumber: 2 },
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds({
    scheduleDates: [startDate],
  });
  expect(result.success).toEqual(true);
  expect(result.scheduledDates).toEqual([startDate]);

  const scheduleAttributes = ['scheduledDate', 'scheduledTime'];
  const hasSchedule = ({ schedule }) => {
    const matchUpScheduleKeys = Object.keys(schedule)
      .filter((key) => scheduleAttributes.includes(key))
      .filter((key) => schedule[key]);
    return !!matchUpScheduleKeys.length;
  };

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const byeMatchUps = matchUps.filter(
    ({ matchUpStatus }) => matchUpStatus === BYE
  );
  expect(byeMatchUps.length).toEqual(1);
  expect(byeMatchUps[0].roundNumber).toEqual(1);

  const scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(95);

  const scheduledTimes = scheduledMatchUps.map(
    ({ schedule }) => schedule.scheduledTime
  );
  const timeMap = scheduledTimes.reduce((timesMapped, scheduledTime) => {
    const time = extractTime(scheduledTime);
    if (!timesMapped[time]) {
      timesMapped[time] = 1;
    } else {
      timesMapped[time] += 1;
    }
    return timesMapped;
  }, {});
  console.log({ timeMap });
});
