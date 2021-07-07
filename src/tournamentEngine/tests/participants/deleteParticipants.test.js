import { PARTICIPANT_ASSIGNED_DRAW_POSITION } from '../../../constants/errorConditionConstants';
import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';

it('can delete participants', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();
  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  const participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  expect(participantIds.length).toBeGreaterThan(0);

  const participantIdsToDelete = participantIds.slice(0, 16);
  let result = tournamentEngine.deleteParticipants({
    participantIds: participantIdsToDelete,
  });
  expect(result.success).toEqual(true);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants.length).toEqual(16);
});

it('will not delete participants in draws', () => {
  const drawProfiles = [{ drawSize: 32 }];
  const { tournamentRecord } = mocksEngine.generateTournamentRecord({
    drawProfiles,
  });
  tournamentEngine.setState(tournamentRecord);
  let { tournamentParticipants } = tournamentEngine.getTournamentParticipants();

  const participantIds = tournamentParticipants.map(
    ({ participantId }) => participantId
  );
  expect(participantIds.length).toBeGreaterThan(0);

  const participantIdsToDelete = participantIds.slice(0, 16);
  let result = tournamentEngine.deleteParticipants({
    participantIds: participantIdsToDelete,
  });
  expect(result.error).toEqual(PARTICIPANT_ASSIGNED_DRAW_POSITION);

  ({ tournamentParticipants } = tournamentEngine.getTournamentParticipants());
  expect(tournamentParticipants.length).toEqual(32);
});
