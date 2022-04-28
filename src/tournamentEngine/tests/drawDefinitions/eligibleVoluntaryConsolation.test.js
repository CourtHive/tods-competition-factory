import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

test('can return participants eligible for voluntary consolation', () => {
  const {
    tournamentRecord,
    drawIds: [drawId],
  } = mocksEngine.generateTournamentRecord({
    drawProfiles: [{ drawSize: 32 }],
    completeAllMatchUps: true,
  });

  tournamentEngine.setState(tournamentRecord);

  let { eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({ drawId });
  expect(losingParticipantIds.length).toEqual(31);
  expect(eligibleParticipants.length).toEqual(16);

  ({ eligibleParticipants, losingParticipantIds } =
    tournamentEngine.getEligibleVoluntaryConsolationParticipants({
      winsLimit: 1,
      drawId,
    }));

  expect(losingParticipantIds.length).toEqual(31);
  expect(eligibleParticipants.length).toEqual(24);
});
