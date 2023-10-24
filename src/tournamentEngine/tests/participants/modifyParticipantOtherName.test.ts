import tournamentEngine from '../../sync';
import mocksEngine from '../../../mocksEngine';
import { expect, it } from 'vitest';

it('can modify participant participantOtherName', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  tournamentEngine.setState(tournamentRecord);
  let {
    participants: [participant],
  } = tournamentEngine.getParticipants();

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
    participants: [participant],
  } = tournamentEngine.getParticipants());

  expect(participant.participantOtherName).toEqual(participantOtherName);
});
