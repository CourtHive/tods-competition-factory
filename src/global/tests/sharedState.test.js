import competitionEngine from '../../competitionEngine/sync';
import tournamentEngine from '../../tournamentEngine/sync';
import mocksEngine from '../../mocksEngine';

test('engines share state', () => {
  const { tournamentRecord: firstRecord } =
    mocksEngine.generateTournamentRecord({
      tournamentName: 'First Tournament',
      participantsProfile: { participantsCount: 64 },
    });
  const { tournamentRecord: secondRecord } =
    mocksEngine.generateTournamentRecord({
      tournamentName: 'Second Tournament',
      participantsProfile: { participantsCount: 32 },
    });
  competitionEngine.setState([firstRecord, secondRecord]);

  const { tournamentIds } = competitionEngine.getTournamentIds();
  expect(tournamentIds.length).toEqual(2);

  let result = tournamentEngine.setTournamentId(tournamentIds[0]);
  expect(result.success).toEqual(true);

  let { tournamentInfo } = tournamentEngine.getTournamentInfo();
  expect(tournamentInfo.tournamentName).toEqual('First Tournament');

  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();
  expect(tournamentParticipants.length).toEqual(64);

  result = tournamentEngine.setTournamentId(tournamentIds[1]);
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants.length).toEqual(32);

  ({ tournamentInfo } = tournamentEngine.getTournamentInfo());
  expect(tournamentInfo.tournamentName).toEqual('Second Tournament');
});
