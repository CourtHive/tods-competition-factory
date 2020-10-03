import { makeDeepCopy } from '../../../../utilities';

import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../../constants/participantTypes';

export function addParticipantContext({ participants }) {
  const participantsWithContext = makeDeepCopy(participants);
  return participantsWithContext;
  /*
  const teamParticipants = participantsWithContext.filter(
    participant => participant.participantType === TEAM
  );
  const groupParticipants = participantsWithContext.filter(
    participant => participant.participantType === GROUP
  );
  const pairParticipants = participantsWithContext.filter(
    participant => participant.participantType === PAIR
  );
  participantsWithContext.forEach(participant => {
    const { participantId } = participant;
    if (participant.participantType === INDIVIDUAL) {
      pairParticipants.forEach(pair => {
        if (pair?.individualParticipants) {
        }
      });
    }
  });
  */
}
