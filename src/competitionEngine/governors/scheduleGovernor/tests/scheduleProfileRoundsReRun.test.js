import tournamentEngine from '../../../../tournamentEngine/sync';
import { hasSchedule } from '../scheduleMatchUps/hasSchedule';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';

import POLICY_SCHEDULING_NO_DAILY_LIMITS from '../../../../fixtures/policies/POLICY_SCHEDULING_NO_DAILY_LIMITS';

it('can auto schedule Round Robin draws respecting daily limits', () => {
  const venueProfiles = [
    {
      venueName: 'venue 1',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 8,
    },
  ];

  const eventProfiles = [{ drawProfiles: [{ drawSize: 16, idPrefix: 'R' }] }];
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

  competitionEngine.attachPolicies({
    policyDefinitions: POLICY_SCHEDULING_NO_DAILY_LIMITS,
  });

  const { tournamentId } = tournamentRecord;

  const {
    event: { eventId },
    drawDefinition,
  } = tournamentEngine.getEvent({ drawId });
  const {
    structures: [{ structureId }],
  } = drawDefinition;

  // add first round of draw to scheduling profile
  let result = competitionEngine.addSchedulingProfileRound({
    scheduleDate: startDate,
    venueId,
    round: { tournamentId, eventId, drawId, structureId, roundNumber: 1 },
  });
  expect(result.success).toEqual(true);
  result = competitionEngine.scheduleProfileRounds({
    scheduleDates: [startDate],
  });
  expect(result.success).toEqual(true);
  expect(result.scheduledDates).toEqual([startDate]);
  expect(result.scheduledMatchUpIds[startDate].length).toEqual(8);

  let { matchUps } = competitionEngine.allCompetitionMatchUps();
  let scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(8);

  let roundNumbers = scheduledMatchUps.reduce(
    (rn, matchUp) =>
      rn.includes(matchUp.roundNumber) ? rn : rn.concat(matchUp.roundNumber),
    []
  );
  expect(roundNumbers).toEqual([1]);

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
  expect(result.overLimitMatchUpIds[startDate].length).toEqual(0);
  expect(result.scheduledMatchUpIds[startDate].length).toEqual(4);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  scheduledMatchUps = matchUps.filter(hasSchedule);
  expect(scheduledMatchUps.length).toEqual(12);

  roundNumbers = scheduledMatchUps.reduce(
    (rn, matchUp) =>
      rn.includes(matchUp.roundNumber) ? rn : rn.concat(matchUp.roundNumber),
    []
  );
  expect(roundNumbers).toEqual([1, 2]);
});
