import mocksEngine from '../../../mocksEngine';
import competitionEngine from '../../sync';
import { expect, it } from 'vitest';

import {
  COMPASS,
  FEED_IN_CHAMPIONSHIP,
} from '../../../constants/drawDefinitionConstants';

it('can bulkSchedule matchUps using matchUpDetails', () => {
  const venueId = 'cc-venue-id';
  const venueProfiles = [
    {
      venueName: 'Club Courts',
      venueAbbreviation: 'CC',
      idPrefix: 'cc-court',
      startTime: '08:00',
      endTime: '20:00',
      courtsCount: 6,
      venueId,
    },
  ];

  const startDate = '2023-06-06';
  const endDate = '2023-06-08';
  const scheduledDate = startDate;

  const tournamentRecord1 = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, drawType: COMPASS }],
    venueProfiles,
    startDate,
    endDate,
  }).tournamentRecord;
  const tournamentRecord2 = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32, drawType: FEED_IN_CHAMPIONSHIP }],
    venueProfiles,
    startDate,
    endDate,
  }).tournamentRecord;

  let result = competitionEngine.setState([
    tournamentRecord1,
    tournamentRecord2,
  ]);

  expect(result.success).toEqual(true);

  const matchUps = competitionEngine.allCompetitionMatchUps().matchUps;
  const scheduleTimes = ['08:00', '09:00', '10:00', '11:00', '12:00'];

  const matchUpDetails = matchUps.map(
    ({ tournamentId, drawId, matchUpId }, i) => ({
      schedule: {
        scheduledTime: scheduleTimes[i % 4],
        courtOrder: (i % 4) + 1,
        scheduledDate,
        venueId,
      },
      tournamentId,
      matchUpId,
      drawId,
    })
  );

  result = competitionEngine.bulkScheduleMatchUps({ matchUpDetails });
  expect(result.success).toEqual(true);
  expect(result.scheduled).toEqual(matchUps.length);
});
