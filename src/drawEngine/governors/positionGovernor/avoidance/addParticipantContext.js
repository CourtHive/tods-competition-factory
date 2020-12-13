import { makeDeepCopy } from '../../../../utilities';

import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../../constants/participantTypes';

export function addParticipantContext({ participants = [] }) {
  const participantsWithContext = makeDeepCopy(participants);
  const teamParticipants = participantsWithContext.filter(
    (participant) => participant.participantType === TEAM
  );
  const groupParticipants = participantsWithContext.filter(
    (participant) => participant.participantType === GROUP
  );

  // pairParticipants should only consider those that are in the same event as current draw
  // TODO: this requires access to the parent event which is not currently in scope
  const pairParticipants = participantsWithContext.filter(
    (participant) => participant.participantType === PAIR
  );

  participantsWithContext.forEach((participant) => {
    const { participantId } = participant;
    participant.teamParticipantIds = [];
    participant.groupParticipantIds = [];
    participant.pairParticipantIds = [];

    if (participant.participantType === INDIVIDUAL) {
      teamParticipants.forEach((team) => {
        (team?.individualParticipants || []).forEach((ip) => {
          if (ip.participantId === participantId) {
            participant.teamParticipantIds.push(ip.participantId);
          }
        });
      });
      pairParticipants.forEach((pair) => {
        (pair?.individualParticipants || []).forEach((ip) => {
          if (ip.participantId === participantId) {
            participant.pairParticipantIds.push(ip.participantId);
          }
        });
      });
      groupParticipants.forEach((group) => {
        (group?.individualParticipants || []).forEach((ip) => {
          if (ip.participantId === participantId) {
            participant.groupParticipantIds.push(ip.participantId);
          }
        });
      });
    }
  });
  return participantsWithContext;
}
