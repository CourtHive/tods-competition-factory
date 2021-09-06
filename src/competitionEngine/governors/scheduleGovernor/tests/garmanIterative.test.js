import { extractTime, timeStringMinutes } from '../../../../utilities/dateTime';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { intersection } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import { FORMAT_STANDARD } from '../../../../fixtures/scoring/matchUpFormats/formatConstants';
import POLICY_SCHEDULING_USTA from '../../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { SINGLES } from '../../../../constants/eventConstants';

it.each([
  {
    startTime: '08:00',
    endTime: '19:00',
    courtsCount: 4,
    matchUpFormatA: FORMAT_STANDARD,
    matchUpFormatB: FORMAT_STANDARD,
  },
  {
    startTime: '08:00',
    endTime: '19:00',
    courtsCount: 4,
    matchUpFormatA: FORMAT_STANDARD,
    matchUpFormatB: 'SET3-S:4/TB7-F:TB7',
  },
])(
  'can clear scheduled matchUps',
  ({ startTime, endTime, courtsCount, matchUpFormatA, matchUpFormatB }) => {
    const venueProfiles = [
      {
        startTime,
        endTime,
        courtsCount,
      },
    ];

    const eventProfiles = [
      {
        eventExtensions: [],
        eventAttributes: {},
        eventName: 'Event Test',
        eventType: SINGLES,
        drawProfiles: [
          {
            drawSize: 4,
            drawName: 'A',
            uniqueParticipants: true,
            matchUpFormat: matchUpFormatA,
            drawExtensions: [],
            drawAttributes: {},
          },
          {
            drawSize: 4,
            drawName: 'B',
            uniqueParticipants: true,
            matchUpFormat: matchUpFormatB,
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
      tournamentExtensions: [],
      tournamentAttributes: {},
      eventProfiles,
      venueProfiles,
      startDate,
      endDate,
    });

    competitionEngine.setState(tournamentRecord);

    competitionEngine.attachPolicies({
      policyDefinitions: POLICY_SCHEDULING_USTA,
    });

    const { tournamentId } = tournamentRecord;

    // add first round of each draw to scheduling profile
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

    const roundMap = scheduledMatchUps
      .map(({ roundNumber, roundPosition, drawName, schedule }) => [
        extractTime(schedule.scheduledTime),
        roundNumber,
        roundPosition,
        drawName,
      ])
      .sort((a, b) => timeStringMinutes(a[0]) - timeStringMinutes(b[0]));
    // expect(roundMap.length).toEqual(scheduledCount);
    console.log(roundMap); // useful for eye-balling

    const { competitionParticipants, participantIdsWithConflicts } =
      competitionEngine.getCompetitionParticipants({
        inContext: true,
        withMatchUps: true,
      });
    console.log({
      participants: competitionParticipants.length,
      participantIdsWithConflicts,
    });
  }
);
