import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import {
  COMPASS,
  FIRST_MATCH_LOSER_CONSOLATION,
} from '../../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../../constants/eventConstants';

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
      eventName: 'Event  Test',
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

  result = competitionEngine.clearScheduledMatchUps();
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(0);
});
