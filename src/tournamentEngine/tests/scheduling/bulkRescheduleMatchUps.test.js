import competitionEngine from '../../../competitionEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

import POLICY_SCHEDULING_USTA from '../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { SINGLES } from '../../../constants/eventConstants';
import {
  CURTIS_CONSOLATION,
  MODIFIED_FEED_IN_CHAMPIONSHIP,
} from '../../../constants/drawDefinitionConstants';
import {
  INVALID_VALUES,
  MISSING_MATCHUP_IDS,
} from '../../../constants/errorConditionConstants';
import { dateStringDaysChange } from '../../../utilities/dateTime';

it('can bulk reschedule matchUps', () => {
  const venueProfiles = [
    {
      venueName: 'venue 1',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 8,
    },
  ];

  const eventProfiles = [
    {
      eventName: 'Event Test',
      eventType: SINGLES,
      drawProfiles: [
        {
          drawSize: 16,
          drawType: MODIFIED_FEED_IN_CHAMPIONSHIP,
        },
        {
          drawSize: 32,
          qualifyingPositions: 4,
          drawName: 'Main Draw',
          drawType: CURTIS_CONSOLATION,
        },
      ],
    },
  ];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const {
    drawIds,
    venueIds: [venueId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    eventProfiles,
    venueProfiles,
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  competitionEngine.attachPolicy({
    policyDefinition: POLICY_SCHEDULING_USTA,
  });

  const { tournamentId } = tournamentRecord;
  const scheduledStructureIds = [];

  // add first round of each draw to scheduling profile
  for (const drawId of drawIds) {
    const {
      event: { eventId },
      drawDefinition: {
        structures: [{ structureId }],
      },
    } = tournamentEngine.getEvent({ drawId });
    scheduledStructureIds.push(structureId);
    const result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: startDate,
      venueId,
      round: { tournamentId, eventId, drawId, structureId, roundNumber: 1 },
    });
    expect(result.success).toEqual(true);
  }

  // add second round of each draw to scheduling profile
  for (const drawId of drawIds) {
    const {
      event: { eventId },
      drawDefinition: {
        structures: [{ structureId }],
      },
    } = tournamentEngine.getEvent({ drawId });
    const result = competitionEngine.addSchedulingProfileRound({
      scheduleDate: startDate,
      venueId,
      round: { tournamentId, eventId, drawId, structureId, roundNumber: 2 },
    });
    expect(result.success).toEqual(true);
  }

  competitionEngine.devContext({ timing: true });
  let result = competitionEngine.scheduleProfileRounds({
    scheduleDates: [startDate],
  });
  competitionEngine.devContext({ timing: false });
  expect(result.success).toEqual(true);
  expect(result.scheduledDates).toEqual([startDate]);

  const scheduleAttributes = ['scheduledDate', 'scheduledTime'];
  const hasSchedule = ({ schedule }) => {
    const matchUpScheduleKeys = Object.keys(schedule)
      .filter((key) => scheduleAttributes.includes(key))
      .filter((key) => schedule[key]);
    return !!matchUpScheduleKeys.length;
  };

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps[0].schedule.scheduledDate).toEqual(startDate);
  expect(scheduledMatchUps.length).toBeLessThan(matchUps.length);

  const matchUpIds = matchUps.map(({ matchUpId }) => matchUpId);
  result = tournamentEngine.bulkRescheduleMatchUps({ matchUpIds });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds,
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds: 'not an array',
  });
  expect(result.error).toEqual(MISSING_MATCHUP_IDS);

  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: 'not an object',
  });
  expect(result.error).toEqual(INVALID_VALUES);

  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: { daysChange: 0, minutesChange: 0 },
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: { daysChange: -1, minutesChange: 0 },
  });
  expect(result.notRescheduled.length).toEqual(scheduledMatchUps.length);

  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: { daysChange: 1, minutesChange: 0 },
  });
  expect(result.rescheduled.length).toEqual(scheduledMatchUps.length);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  scheduledMatchUps = matchUps.filter(hasSchedule);

  expect(scheduledMatchUps[0].schedule.scheduledDate).toEqual(
    dateStringDaysChange(startDate, 1)
  );

  expect(scheduledMatchUps[0].schedule.scheduledTime).toEqual(
    '2022-01-01T08:00'
  );
  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: { minutesChange: 300 },
  });
  expect(result.success).toEqual(true);
  expect(result.rescheduled.length).toEqual(scheduledMatchUps.length);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps[0].schedule.scheduledTime).toEqual(
    '2022-01-01T13:00'
  );

  // nothing should be rescheduled because scheduledTimes would be next day
  result = tournamentEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: { minutesChange: 800 },
  });
  expect(result.success).toEqual(true);
  expect(result.notRescheduled.length).toEqual(scheduledMatchUps.length);

  result = competitionEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: { minutesChange: 30 },
  });
  expect(result.success).toEqual(true);

  result = competitionEngine.bulkRescheduleMatchUps({
    matchUpIds,
    scheduleChange: { daysChange: 2 },
  });
  expect(result.success).toEqual(true);
});
