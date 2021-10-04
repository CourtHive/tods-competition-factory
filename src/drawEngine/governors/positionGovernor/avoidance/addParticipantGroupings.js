import { makeDeepCopy } from '../../../../utilities';

import {
  GROUP,
  INDIVIDUAL,
  PAIR,
  TEAM,
} from '../../../../constants/participantTypes';

export function addParticipantGroupings({ participants = [] }) {
  const participantsWithGroupings = makeDeepCopy(participants, true, true);
  const teamParticipants = participantsWithGroupings.filter(
    (participant) => participant.participantType === TEAM
  );
  const groupParticipants = participantsWithGroupings.filter(
    (participant) => participant.participantType === GROUP
  );

  // should pairParticipants only consider those that are in the same event as current draw?
  // TODO: this requires access to the parent event which is not currently in scope
  const pairParticipants = participantsWithGroupings.filter(
    (participant) => participant.participantType === PAIR
  );

  participantsWithGroupings.forEach((participant) => {
    if (participant.participantType === INDIVIDUAL) {
      const { participantId } = participant;
      participant.teamParticipantIds = [];
      participant.groupParticipantIds = [];
      participant.pairParticipantIds = [];

      teamParticipants.forEach((team) => {
        (team?.individualParticipantIds || []).forEach(
          (individualParticipantId) => {
            if (individualParticipantId === participantId) {
              participant.pairParticipantIds.push(team.participantId);
            }
          }
        );
      });
      pairParticipants.forEach((pair) => {
        (pair?.individualParticipantIds || []).forEach(
          (individualParticipantId) => {
            if (individualParticipantId === participantId) {
              participant.pairParticipantIds.push(pair.participantId);
            }
          }
        );
      });
      groupParticipants.forEach((group) => {
        (group?.individualParticipantIds || []).forEach(
          (individualParticipantId) => {
            if (individualParticipantId === participantId) {
              participant.pairParticipantIds.push(group.participantId);
            }
          }
        );
      });
    }
  });
  return participantsWithGroupings;
}
