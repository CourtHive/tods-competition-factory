import mocksEngine from '../../../../mocksEngine';
import tournamentEngine from '../../../../tournamentEngine/sync';
import { intersection, unique } from '../../../../utilities';
import competitionEngine from '../../../sync';

it('can update matchUp court assignments accross multiple events/draws', () => {
  const drawProfiles = [
    {
      drawSize: 8,
      participantsCount: 6,
    },
    {
      drawSize: 8,
      participantsCount: 6,
    },
    {
      drawSize: 8,
      participantsCount: 6,
    },
  ];
  let result = mocksEngine.generateTournamentRecord({
    drawProfiles,
    inContext: true,
  });

  const myCourts = { venueName: 'My Courts' };
  result = tournamentEngine.devContext(true).addVenue({ venue: myCourts });
  const {
    venue: { venueId },
  } = result;
  expect(result.success).toEqual(true);

  const courtDayDate = '2020-01-01T00:00';
  let { courts, success } = tournamentEngine.devContext(true).addCourts({
    venueId,
    courtsCount: 3,
  });
  expect(success).toEqual(true);
  expect(courts.length).toEqual(3);
  const courtIds = courts.map(({ courtId }) => courtId);

  const { tournamentRecord } = tournamentEngine.getState();
  const { tournamentId } = tournamentRecord;

  let { matchUps } = tournamentEngine.allTournamentMatchUps();
  const courtAssignments = matchUps.map(
    ({ matchUpId, eventId, drawId }, index) => ({
      tournamentId,
      matchUpId,
      eventId,
      drawId,
      courtId: courtIds[index % 3],
    })
  );
  result = competitionEngine.setState({ [tournamentId]: tournamentRecord });
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
