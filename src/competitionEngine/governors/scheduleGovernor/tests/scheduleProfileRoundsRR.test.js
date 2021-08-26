import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import POLICY_SCHEDULING_USTA from '../../../../fixtures/policies/POLICY_SCHEDULING_USTA';
import { ROUND_ROBIN } from '../../../../constants/drawDefinitionConstants';
import { SINGLES } from '../../../../constants/eventConstants';

it('can auto schedule Round Robin draws', () => {
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
          drawType: ROUND_ROBIN,
        },
      ],
    },
  ];
  const startDate = '2022-01-01';
  const endDate = '2022-01-07';
  const {
    drawIds: [drawId],
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

  // add first round of draw to scheduling profile
  const {
    event: { eventId },
    drawDefinition,
  } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;

  scheduledStructureIds.push(structureId);
  let result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId,
    round: { tournamentId, eventId, drawId, structureId, roundNumber: 1 },
  });
  expect(result.success).toEqual(true);

  // add second round of draw to scheduling profile
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

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(16);

  const roundNumbers = scheduledMatchUps.reduce(
    (rn, matchUp) =>
      rn.includes(matchUp.roundNumber) ? rn : rn.concat(matchUp.roundNumber),
    []
  );
  expect(roundNumbers).toEqual([1, 2]);
});
