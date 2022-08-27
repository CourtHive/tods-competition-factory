import { chunkArray } from '../../../../utilities';
import mocksEngine from '../../../../mocksEngine';
import competitionEngine from '../../../sync';
import {
  addDays,
  dateRange,
  extractDate,
} from '../../../../utilities/dateTime';

it('supports pro-scheduling', () => {
  const startDate = extractDate(new Date().toISOString());
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
});
