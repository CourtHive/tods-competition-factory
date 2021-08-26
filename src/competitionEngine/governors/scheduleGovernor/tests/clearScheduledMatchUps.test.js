import { extractTime, timeStringMinutes } from '../../../../utilities/dateTime';
import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import POLICY_SCHEDULING_USTA from '../../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { SINGLES } from '../../../../constants/eventConstants';
import {
  COMPASS,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../../../constants/drawDefinitionConstants';

it('can clear scheduled matchUps', () => {
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
          drawType: FIRST_MATCH_LOSER_CONSOLATION,
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

  let result = competitionEngine.scheduleProfileRounds({
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

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let scheduledMatchUps = matchUps.filter(hasSchedule);
  const expectedStructureIds = scheduledMatchUps.every(({ structureId }) =>
    scheduledStructureIds.includes(structureId)
  );
  expect(expectedStructureIds).toEqual(true);
  expect(scheduledMatchUps[0].schedule.timeAfterRecovery).toEqual('10:30');

  const { competitionParticipants, participantIdsWithConflicts } =
    competitionEngine.getCompetitionParticipants({
      inContext: true,
      withMatchUps: true,
    });

  expect(participantIdsWithConflicts.length).toEqual(0);

  let participantsWithMultipleScheduledMatchUps = 0;
  competitionParticipants.forEach((participant) => {
    const { matchUps = [], potentialMatchUps = [] } = participant;

    const { scheduledMatchUps } = tournamentEngine.participantScheduledMatchUps(
      { matchUps: matchUps.concat(potentialMatchUps) }
    );

    if (scheduledMatchUps) {
      const dates = Object.keys(scheduledMatchUps);
      if (
        dates.length &&
        scheduledMatchUps[dates[0]] &&
        scheduledMatchUps[dates[0]].length > 1
      ) {
        participantsWithMultipleScheduledMatchUps += 1;
        const dateMatchUps = scheduledMatchUps[dates[0]];
        const firstMatchAfterRecoveryMinutes = timeStringMinutes(
          dateMatchUps[0].schedule.timeAfterRecovery
        );
        const secondMatchStartMinutes = timeStringMinutes(
          extractTime(dateMatchUps[1].schedule.scheduledTime)
        );
        expect(secondMatchStartMinutes).toBeGreaterThanOrEqual(
          firstMatchAfterRecoveryMinutes
        );
      }
    }
  });

  expect(participantsWithMultipleScheduledMatchUps).toBeGreaterThan(1);

  result = competitionEngine.getVenuesReport();

  result = competitionEngine.clearScheduledMatchUps();
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(0);
});
