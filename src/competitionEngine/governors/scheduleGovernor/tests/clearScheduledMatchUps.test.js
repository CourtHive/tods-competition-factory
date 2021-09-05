import { extractTime, timeStringMinutes } from '../../../../utilities/dateTime';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { intersection } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';
import { SINGLES } from '../../../../constants/eventConstants';
import {
  COMPASS,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../../../constants/drawDefinitionConstants';

it.each([
  {
    startTime: '08:00',
    endTime: '20:00',
    courtsCount: 4,
    twoMatchUps: 24,
    scheduledCount: 30,
    availableMinutes: 2880,
    scheduledMinutes: 2700,
    percentUtilization: '93.75',
  },
  {
    startTime: '08:00',
    endTime: '19:00',
    courtsCount: 5,
    twoMatchUps: 44,
    scheduledCount: 35,
    availableMinutes: 3300,
    scheduledMinutes: 3150,
    percentUtilization: '95.45',
  },
])(
  'can clear scheduled matchUps',
  ({
    startTime,
    endTime,
    courtsCount,
    twoMatchUps,
    scheduledCount,
    availableMinutes,
    scheduledMinutes,
    percentUtilization,
  }) => {
    const venueProfiles = [
      {
        venueName: 'venue 1',
        startTime,
        endTime,
        courtsCount,
      },
    ];

    const eventProfiles = [
      {
        eventName: 'Event Test',
        eventType: SINGLES,
        drawProfiles: [
          {
            drawSize: 16,
            drawName: 'Sixteen',
            drawType: FIRST_MATCH_LOSER_CONSOLATION,
            uniqueParticipants: true,
          },
          {
            drawSize: 32,
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

    competitionEngine.attachPolicies({
      policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
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

    // Scheduled Profile Rounds ##############################
    let result = competitionEngine.scheduleProfileRounds({
      scheduleDates: [startDate],
    });
    expect(result.success).toEqual(true);
    expect(result.scheduledDates).toEqual([startDate]);
    // #######################################################

    // get the participantIds for each draw
    const drawEnteredParticipantIds = [];
    for (const drawId of drawIds) {
      const {
        drawDefinition: { entries: drawEntries },
      } = tournamentEngine.getEvent({ drawId });
      drawEnteredParticipantIds.push(
        drawEntries.map(({ participantId }) => participantId)
      );
    }
    // expect the two draws to have unique participants
    expect(
      intersection(drawEnteredParticipantIds[0], drawEnteredParticipantIds[1])
        .length
    ).toEqual(0);

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

    const roundMap = scheduledMatchUps
      .map(({ roundNumber, roundPosition, drawName, schedule }) => [
        extractTime(schedule.scheduledTime),
        roundNumber,
        roundPosition,
        drawName,
      ])
      .sort((a, b) => timeStringMinutes(a[0]) - timeStringMinutes(b[0]));
    expect(roundMap.length).toEqual(scheduledCount);
    // console.log(roundMap); // useful for eye-balling

    const { competitionParticipants, participantIdsWithConflicts } =
      competitionEngine.getCompetitionParticipants({
        inContext: true,
        withMatchUps: true,
      });
    expect(competitionParticipants.length).toEqual(48);

    expect(participantIdsWithConflicts.length).toEqual(0);

    let participantsWithMultipleScheduledMatchUps = 0;
    competitionParticipants.forEach((participant) => {
      const { matchUps = [], potentialMatchUps = [] } = participant;
      const scheduledMatchUps = matchUps
        .concat(...potentialMatchUps)
        .filter(hasSchedule);
      if (scheduledMatchUps.length > 1) {
        participantsWithMultipleScheduledMatchUps += 1;
        const firstMatchAfterRecoveryMinutes = timeStringMinutes(
          scheduledMatchUps[0].schedule.timeAfterRecovery
        );
        const secondMatchStartMinutes = timeStringMinutes(
          extractTime(scheduledMatchUps[1].schedule.scheduledTime)
        );
        expect(secondMatchStartMinutes).toBeGreaterThanOrEqual(
          firstMatchAfterRecoveryMinutes
        );
      }
    });

    expect(participantsWithMultipleScheduledMatchUps).toEqual(twoMatchUps);

    const {
      venuesReport: [{ venueReport }],
    } = competitionEngine.getVenuesReport();
    const dateVenueReport = venueReport[startDate];
    expect(dateVenueReport.scheduledMatchUpsCount).toEqual(scheduledCount);
    expect(dateVenueReport.availableCourts).toEqual(courtsCount);
    expect(dateVenueReport.availableMinutes).toEqual(availableMinutes);
    expect(dateVenueReport.scheduledMinutes).toEqual(scheduledMinutes);
    expect(dateVenueReport.percentUtilization).toEqual(percentUtilization);

    result = competitionEngine.clearScheduledMatchUps();
    expect(result.success).toEqual(true);

    ({ matchUps } = competitionEngine.allCompetitionMatchUps());
    scheduledMatchUps = matchUps.filter(hasSchedule);
    expect(scheduledMatchUps.length).toEqual(0);
  }
);
