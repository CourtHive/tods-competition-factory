import competitionEngine from '../../../competitionEngine/sync';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('can return participant scheduled matchUps', () => {
  const startDate = '2022-09-24';
  const endDate = '2022-09-28';

  const venueProfiles = [{ courtsCount: 3 }];
  const {
    tournamentRecord,
    venueIds: [venueId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
    venueProfiles,
    startDate,
    endDate,
  });

  tournamentEngine.setState(tournamentRecord);

  const { rounds } = competitionEngine.getRounds();
  const schedulingProfile = [
    { scheduleDate: startDate, venues: [{ venueId, rounds }] },
  ];

  let result = competitionEngine.setSchedulingProfile({ schedulingProfile });
  expect(result.success).toEqual(true);

  result = competitionEngine.scheduleProfileRounds();
  expect(result.scheduledMatchUpIds[startDate].length).toEqual(23);

  result = tournamentEngine.getParticipantSchedules();
  expect(
    result.participantSchedules.map(({ matchUps }) => matchUps.length)
  ).toEqual([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 1, 1, 1, 1,
  ]);
  expect(
    result.participantSchedules.map(
      ({ potentialMatchUps }) => potentialMatchUps.length
    )
  ).toEqual([
    1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1,
    1, 1, 1, 0, 0, 0, 0,
  ]);
});
