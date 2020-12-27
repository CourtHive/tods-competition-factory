import {
  SIGNED_IN,
  SIGNED_OUT,
  SIGN_IN_STATUS,
} from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function participantsSignInStatus({
  tournamentRecord,
  participantIds,
  signInState,
}) {
  const validSignInState = [SIGNED_IN, SIGNED_OUT].includes(signInState);

  const participants = tournamentRecord.participants || [];
  let participantsModified;

  if (
    validSignInState &&
    participants.length &&
    Array.isArray(participantIds)
  ) {
    const createdAt = new Date().toISOString();
    participants.forEach((participant) => {
      if (participantIds.includes(participant.participantId)) {
        if (!participant.timeItems) participant.timeItems = [];
        const timeItem = {
          itemType: SIGN_IN_STATUS,
          itemValue: signInState,
          createdAt,
        };
        participant.timeItems.push(timeItem);
        participantsModified = true;
      }
    });
  }

  if (participantsModified) return SUCCESS;
}
