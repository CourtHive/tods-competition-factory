import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

it('can modify participant participantOtherName', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  tournamentEngine.setState(tournamentRecord);
  let {
    tournamentParticipants: [participant],
  } = tournamentEngine.getTournamentParticipants();

  const { participantId } = participant;
  let result = tournamentEngine.modifyParticipantOtherName({
    participantId,
  });
  // participantOtherName can be undefined
  expect(result.success).toEqual(true);

  const participantOtherName = 'Nickname';
  result = tournamentEngine.modifyParticipantOtherName({
    participantId,
    participantOtherName,
  });
  expect(result.success).toEqual(true);

  ({
    tournamentParticipants: [participant],
  } = tournamentEngine.getTournamentParticipants());

  expect(participant.participantOtherName).toEqual(participantOtherName);
});
