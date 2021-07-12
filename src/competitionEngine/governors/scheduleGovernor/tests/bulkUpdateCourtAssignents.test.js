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

  let { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });

  tournamentEngine.setState(tournamentRecord);
  const myCourts = { venueName: 'My Courts' };
  let result = tournamentEngine
    .devContext({ addVenue: true })
    .addVenue({ venue: myCourts });
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

  ({ tournamentRecord } = tournamentEngine.getState());
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
