import { addParticipantsToGrouping } from './participantGroupings';

import { SUCCESS } from "src/constants/resultConstants";

export function addParticipant({tournamentRecord, participant}) {
  const { participantId } = participant || {};
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const idExists = tournamentRecord.participants.reduce((p, c) => c.participant === participantId || p, false);
  if (!participantId || idExists) return;
  tournamentRecord.participants.push(participant);
  return SUCCESS;
}

export function addParticipants({tournamentRecord, participants, source, teamId}) {
  if (!tournamentRecord.participants) tournamentRecord.participants = [];
  const existingParticipantIds = tournamentRecord.participants.map(p=>p.participantId);
  const newParticipants = participants
    .filter(participant => !existingParticipantIds.includes(participant.participantId));

  if (newParticipants.length) {
    tournamentRecord.participants = tournamentRecord.participants.concat(...newParticipants);
    if (source !== undefined) participantSource({tournamentRecord, source});
    if (teamId) {
      const participantIds = newParticipants.map(np => np.participantId);
      addParticipantsToGrouping({
        tournamentRecord,
        participantIds,
        groupingParticiantId: teamId,
        removeFromOtherTeams: true
      });
    }
    return SUCCESS;
  }
}

function participantSource({tournamentRecord, source}) {
  if (!tournamentRecord.tournamentProfile) tournamentRecord.tournamentProfile = {};
  tournamentRecord.tournamentProfile.participantSource = source;
}