import tournamentEngine from '../../engines/syncEngine';
import { intersection, unique } from '../../../utilities';
import mocksEngine from '../../../mocksEngine';
import competitionEngine from '../../engines/competitionEngine';
import { expect, it } from 'vitest';

it('can update matchUp court assignments accross multiple events/draws', () => {
  const drawProfiles = [
    {
      participantsCount: 6,
      drawSize: 8,
    },
    {
      participantsCount: 6,
      drawSize: 8,
    },
    {
      participantsCount: 6,
      drawSize: 8,
    },
  ];

  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const myCourts = { venueName: 'My Courts' };
  let result = tournamentEngine.addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const courtDayDate = '2020-01-01T00:00';
  result = tournamentEngine.devContext(true).addCourts({
    courtsCount: 3,
    venueId,
  });
  const { courtIds, success } = result;
  expect(success).toEqual(true);

  ({ tournamentRecord } = tournamentEngine.getTournament());
  const { tournamentId } = tournamentRecord;

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  const courtAssignments = matchUps.map(
    ({ matchUpId, eventId, drawId }, index) => ({
      courtId: courtIds[index % 3],
      tournamentId,
      matchUpId,
      eventId,
      drawId,
    })
  );
  result = competitionEngine.setState([tournamentRecord]);
  expect(result.success).toEqual(true);
  result = competitionEngine.bulkUpdateCourtAssignments({
    courtAssignments,
    courtDayDate,
  });
  expect(result.success).toEqual(true);

  ({ matchUps } = competitionEngine.allCompetitionMatchUps());
  const scheduledCourtIds = unique(
    matchUps.map(({ schedule }) => schedule?.courtId)
  );
  expect(intersection(scheduledCourtIds, courtIds).length).toEqual(
    courtIds.length
  );
});
