import { visualizeScheduledMatchUps } from '../../../../global/testHarness/testUtilities/visualizeScheduledMatchUps';
import { extractTime, timeStringMinutes } from '../../../../utilities/dateTime';
import { getParticipantId } from '../../../../global/functions/extractors';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import { intersection } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import { FORMAT_STANDARD } from '../../../../fixtures/scoring/matchUpFormats/formatConstants';
import POLICY_SCHEDULING_USTA from '../../../../fixtures/policies/POLICY_SCHEDULING_USTA';

const showGlobalLog = false;

it.each([
  {
    startTime: '08:00',
    endTime: '19:00',
    courtsCount: 4,
    matchUpFormatA: FORMAT_STANDARD,
    matchUpFormatB: FORMAT_STANDARD,
    iterations: 1,
  },
  {
    startTime: '08:00',
    endTime: '19:00',
    courtsCount: 4,
    matchUpFormatA: FORMAT_STANDARD,
    matchUpFormatB: 'SET3-S:4/TB7-F:TB7',
    iterations: 4,
  },
])(
  'can schedule iteratively',
  ({
    startTime,
    endTime,
    courtsCount,
    matchUpFormatA,
    matchUpFormatB,
    iterations,
  }) => {
    const startDate = '2022-01-01';
    const endDate = '2022-01-07';
    const venueProfiles = [
      {
        venueId: 'venueId',
        courtsCount,
        startTime,
        endTime,
      },
    ];

    const drawProfiles = [
      {
        drawSize: 4,
        drawName: 'A',
        idPrefix: 'A',
        drawId: 'firstDraw',
        uniqueParticipants: true,
        matchUpFormat: matchUpFormatA,
        drawExtensions: [],
      },
      {
        drawSize: 4,
        drawName: 'B',
        idPrefix: 'B',
        drawId: 'secondDraw',
        matchUpFormat: matchUpFormatB,
      },
    ];
    const schedulingProfile = [
      {
        scheduleDate: startDate,
        venues: [
          {
            venueId: 'venueId',
            rounds: [
              { drawId: 'firstDraw', winnerFinishingPositionRange: '1-2' },
              { drawId: 'secondDraw', winnerFinishingPositionRange: '1-2' },
            ],
          },
        ],
      },
    ];

    const {
      drawIds,
      venueIds: [venueId],
      tournamentRecord,
    } = mocksEngine.generateTournamentRecord({
      policyDefinitions: POLICY_SCHEDULING_USTA,
      tournamentExtensions: [],
      tournamentAttributes: {},
      autoSchedule: true,
      schedulingProfile,
      venueProfiles,
      drawProfiles,
      startDate,
      endDate,
    });

    competitionEngine.setState(tournamentRecord);
    const { tournamentId } = tournamentRecord;

    let { matchUps } = competitionEngine.allCompetitionMatchUps();
    let scheduledMatchUps = matchUps.filter(hasSchedule);
    visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog });

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

    competitionEngine.devContext({ virtual: true });
    // Scheduled Profile Rounds ##############################
    let result = competitionEngine.scheduleProfileRounds({
      scheduleDates: [startDate],
      garmanSinglePass: false,
    });
    expect(result.success).toEqual(true);
    if (result.iterations) expect(result.iterations).toEqual(iterations);
    expect(result.scheduledDates).toEqual([startDate]);
    // #######################################################

    ({ matchUps } = competitionEngine.allCompetitionMatchUps());
    scheduledMatchUps = matchUps.filter(hasSchedule);
    visualizeScheduledMatchUps({ scheduledMatchUps, showGlobalLog });

    // get the participantIds for each draw
    const drawEnteredParticipantIds = [];
    for (const drawId of drawIds) {
      const {
        drawDefinition: { entries: drawEntries },
      } = tournamentEngine.getEvent({ drawId });
      drawEnteredParticipantIds.push(drawEntries.map(getParticipantId));
    }
    // expect the two draws to have unique participants
    expect(
      intersection(drawEnteredParticipantIds[0], drawEnteredParticipantIds[1])
        .length
    ).toEqual(0);

    ({ matchUps } = competitionEngine.allCompetitionMatchUps());
    scheduledMatchUps = matchUps.filter(hasSchedule);

    const roundMap = scheduledMatchUps
      .map(({ roundNumber, roundPosition, drawName, schedule }) => [
        extractTime(schedule.scheduledTime),
        roundNumber,
        roundPosition,
        drawName,
      ])
      .sort((a, b) => timeStringMinutes(a[0]) - timeStringMinutes(b[0]));
    expect(roundMap.length).toEqual(scheduledMatchUps.length);
    // console.log(roundMap); // useful for eye-balling

    const { competitionParticipants, participantIdsWithConflicts } =
      competitionEngine.getCompetitionParticipants({
        inContext: true,
        withMatchUps: true,
        withScheduleItems: true,
      });
    expect(participantIdsWithConflicts.length).toEqual(0);
    expect(competitionParticipants.length).toEqual(8);
  }
);
