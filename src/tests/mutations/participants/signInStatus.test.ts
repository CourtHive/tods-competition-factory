import mocksEngine from '@Assemblies/engines/mock';
import tournamentEngine from '@Engines/syncEngine';
import queryEngine from '@Engines/queryEngine';
import { expect, it } from 'vitest';

// constants
import { SIGNED_IN, SIGNED_OUT, SIGN_IN_STATUS } from '@Constants/participantConstants';
import {
  INVALID_VALUES,
  MISSING_PARTICIPANT_ID,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
} from '@Constants/errorConditionConstants';

it('can sign participants in and out', () => {
  const { tournamentRecord } = mocksEngine.generateTournamentRecord();

  tournamentEngine.setState(tournamentRecord);

  const { participants } = tournamentEngine.getParticipants();

  const { participantId } = participants[0];

  let result = queryEngine.getParticipantSignInStatus({
    participantId,
  });
  expect(result).toBeUndefined();

  result = tournamentEngine.modifyParticipantsSignInStatus({
    // participantIds: [participantId],
    signInState: SIGNED_IN,
  });
  expect(result.error).toEqual(MISSING_VALUE);

  result = tournamentEngine.modifyParticipantsSignInStatus({
    participantIds: ['foo'],
    signInState: SIGNED_IN,
  });
  expect(result.error).toEqual(INVALID_VALUES);

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

  result = tournamentEngine.getParticipantSignInStatus({});
  expect(result.error).toEqual(MISSING_PARTICIPANT_ID);

  result = tournamentEngine.getParticipantSignInStatus({
    participantId: 'unknownId',
  });
  expect(result.error).toEqual(PARTICIPANT_NOT_FOUND);

  let { timeItem, previousItems } = tournamentEngine.getTimeItem({
    returnPreviousValues: true,
    itemType: SIGN_IN_STATUS,
    participantId,
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

  ({ timeItem, previousItems } = tournamentEngine.getTimeItem({
    returnPreviousValues: true,
    itemType: SIGN_IN_STATUS,
    participantId,
  }));
  expect(previousItems.length).toEqual(2);
  expect(timeItem.itemValue).toEqual(SIGNED_IN);
});
