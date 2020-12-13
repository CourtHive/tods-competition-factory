import {
  addParticipantsToGrouping,
  removeParticipantsFromAllTeams,
} from './participantGroupings';
import { addParticipants } from './addParticipants';

import {
  SIGNED_IN,
  SIGNED_OUT,
  SIGN_IN_STATUS,
} from '../../../constants/participantConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { INDIVIDUAL } from '../../../constants/participantTypes';

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
          itemSubject: SIGN_IN_STATUS,
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

// function currently unused
export function modifyParticipant({ tournamentRecord, participant, teamId }) {
  let modificationApplied;
  const { participantId } = participant || {};

  // TODO: use something like keyWalk to assign
  // TODO: integrity, check data structure conforms to TODS
  // TODO: test modifying a participantType: 'PAIR' or 'TEAM' for nested participantIds

  const tournamentParticipants = tournamentRecord.participants || [];
  const existingParticipant = tournamentParticipants.find((existing) => {
    return existing.participantId === participant?.participantId;
  });
  if (existingParticipant) {
    Object.assign(existingParticipant, participant);
    modificationApplied = true;
  } else {
    return addParticipants({
      tournamentRecord,
      participants: [participant],
      teamId,
    });
  }

  if (teamId) {
    const result = addParticipantsToGrouping({
      tournamentRecord,
      groupingParticipantId: teamId,
      participantIds: [participantId],
      removeFromOtherTeams: true,
    });
    if (result?.success) modificationApplied = true;
  } else if (participant.participantType === INDIVIDUAL || participant.person) {
    console.log('remove from all teams');
    removeParticipantsFromAllTeams({
      tournamentRecord,
      participantIds: [participantId],
    });
  }

  if (modificationApplied) return SUCCESS;
}
