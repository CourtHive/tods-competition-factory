import tournamentEngine from '../..';
import mocksEngine from '../../../mocksEngine';

it('can modify participant names', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  tournamentEngine.setState(tournamentRecord);
  let {
    tournamentParticipants: [participant],
  } = tournamentEngine.getTournamentParticipants();

  const { participantId } = participant;
  let result = tournamentEngine.modifyParticipantName({ participantId });
  expect(result.error).not.toBeUndefined();

  const participantName = 'Participant Name';
  result = tournamentEngine.modifyParticipantName({
    participantId,
    participantName,
  });
  expect(result.success).toEqual(true);

  ({
    tournamentParticipants: [participant],
  } = tournamentEngine.getTournamentParticipants());

  expect(participant.participantName).toEqual(participantName);
});
