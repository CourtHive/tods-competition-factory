import { addDays, dateRange } from '../../../../utilities/dateTime';
import { chunkArray } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import { expect } from 'vitest';

it('supports pro-scheduling', () => {
  const startDate = '2022-08-27'; // date on which first pro scheduling was first successfully run
  const endDate = addDays(startDate, 3);
  const {
    venueIds: [venueId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    venueProfiles: [{ courtsCount: 6 }],
    drawProfiles: [{ drawSize: 32 }],
    startDate,
    endDate,
  });

  competitionEngine.setState(tournamentRecord);

  const tournamentDateRange = dateRange(startDate, endDate);
  const { rounds } = competitionEngine.getRounds();
  const roundChunks = chunkArray(rounds, 2);

  const schedulingProfile = roundChunks.map((chunk, i) => ({
    scheduleDate: tournamentDateRange[i],
    venues: [{ venueId, rounds: chunk }],
  }));
  let result = competitionEngine.setSchedulingProfile({ schedulingProfile });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds({ pro: true });
  expect(result.success).toEqual(true);

  const { matchUps } = competitionEngine.allCompetitionMatchUps();
  const roundSchedules = matchUps.map(
    ({ schedule: { scheduledTime }, roundNumber }) => [
      roundNumber,
      scheduledTime,
    ]
  );

  // no recovery time has been defined and the default averageMatchUpTime is 90 minutes
  expect(roundSchedules).toEqual([
    [1, '2022-08-27T07:00'], // rounds 1 & 2 are scheduled for the 1st day
    [1, '2022-08-27T07:00'],
    [1, '2022-08-27T07:00'],
    [1, '2022-08-27T07:00'],
    [1, '2022-08-27T07:00'],
    [1, '2022-08-27T07:00'],
    [1, '2022-08-27T08:30'],
    [1, '2022-08-27T08:30'],
    [1, '2022-08-27T08:30'],
    [1, '2022-08-27T08:30'],
    [1, '2022-08-27T08:30'],
    [1, '2022-08-27T08:30'],
    [1, '2022-08-27T10:00'],
    [1, '2022-08-27T10:00'],
    [1, '2022-08-27T10:00'],
    [1, '2022-08-27T10:00'],
    [2, '2022-08-27T10:00'],
    [2, '2022-08-27T10:00'],
    [2, '2022-08-27T11:30'],
    [2, '2022-08-27T11:30'],
    [2, '2022-08-27T11:30'],
    [2, '2022-08-27T11:30'],
    [2, '2022-08-27T11:30'],
    [2, '2022-08-27T11:30'],
    [3, '2022-08-28T07:00'], // rounds 3 & 4 are scheduled for the 2nd day
    [3, '2022-08-28T07:00'],
    [3, '2022-08-28T07:00'],
    [3, '2022-08-28T07:00'],
    [4, '2022-08-28T08:30'],
    [4, '2022-08-28T08:30'],
    [5, '2022-08-29T07:00'], // round 5 is scheduled for the 3rd day
  ]);
});
