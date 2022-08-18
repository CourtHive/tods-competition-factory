import { addDays, extractDate } from '../../../../utilities/dateTime';
import tournamentEngine from '../../../../tournamentEngine/sync';
import mocksEngine from '../../../../mocksEngine';
import { it } from 'vitest';

it('supports pro-scheduling', () => {
  const startDate = extractDate(new Date().toISOString());
  const endDate = addDays(startDate, 3);
  console.log({ startDate, endDate });
  const {
    venueIds: [venueId],
    // drawIds: [drawId],
    tournamentRecord,
  } = mocksEngine.generateTournamentRecord({
    venueProfiles: [{ courtsCount: 6 }],
    drawProfiles: [{ drawSize: 32 }],
    startDate,
    endDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const { rounds } = tournamentEngine.getRounds();
  const schedulingProfile = [
    { scheduleDate: startDate, venues: [{ venueId, rounds }] },
  ];

  console.log(schedulingProfile);
});
