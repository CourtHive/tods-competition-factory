import mocksEngine from '../../../mocksEngine';
import tournamentEngine from '../../sync';
import {
  SIGNED_IN,
  SIGNED_OUT,
  SIGN_IN_STATUS,
} from '../../../constants/participantConstants';

it('can sign participants in and out', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  tournamentEngine.setState(tournamentRecord);

  const { tournamentParticipants } =
    tournamentEngine.getTournamentParticipants();

  const { participantId } = tournamentParticipants[0];

  let result = tournamentEngine.getParticipantSignInStatus({
    participantId,
  });
  expect(result).toBeUndefined();

  result = tournamentEngine.modifyParticipantsSignInStatus({
    participantIds: [participantId],
    signInState: SIGNED_IN,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.modifyParticipantsSignInStatus({
    participantIds: [participantId],
    signInState: SIGNED_IN,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getParticipantSignInStatus({
    participantId,
  });
  expect(result).toEqual(SIGNED_IN);

  let { timeItem, previousItems } = tournamentEngine.getParticipantTimeItem({
    participantId,
    returnPreviousValues: true,
    itemType: SIGN_IN_STATUS,
  });
  expect(previousItems.length).toEqual(0);
  expect(timeItem.itemValue).toEqual(SIGNED_IN);

  result = tournamentEngine.modifyParticipantsSignInStatus({
    participantIds: [participantId],
    signInState: SIGNED_OUT,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.modifyParticipantsSignInStatus({
    participantIds: [participantId],
    signInState: SIGNED_IN,
  });
  expect(result.success).toEqual(true);

  result = tournamentEngine.getParticipantSignInStatus({
    participantId,
  });
  expect(result).toEqual(SIGNED_IN);

  ({ timeItem, previousItems } = tournamentEngine.getParticipantTimeItem({
    participantId,
    returnPreviousValues: true,
    itemType: SIGN_IN_STATUS,
  }));
  expect(previousItems.length).toEqual(2);
  expect(timeItem.itemValue).toEqual(SIGNED_IN);
});
