import { SUCCESS } from '../../../constants/resultConstants';
import { addNotice, getTopics } from '../../../global/globalState';

export function mergeParticipants({
  tournamentRecord,
  participants: incomingParticipants = [],
}) {
  if (!tournamentRecord.participants) tournamentRecord.participants = [];

  incomingParticipants = incomingParticipants.filter(
    (participant) => participant.participantId
  );

  const idMap = Object.assign(
    ...incomingParticipants.map((p) => ({ [p.participantId]: p }))
  );

  // check for overlap with existing players, add any newly retrieved attributes to existing
  const modifiedParticipants = [];
  tournamentRecord.participants.forEach((participant) => {
    if (idMap[participant.participantId]) {
      Object.assign(participant, idMap[participant.participantId]);
      modifiedParticipants.push(participant);
    }
  });

  const existingParticipantIds = tournamentRecord.participants.map(
    (p) => p.participantId
  );
  const newParticipants = incomingParticipants.filter((p) =>
    existingParticipantIds.includes(p.participantId)
  );

  const { topics } = getTopics();

  if (newParticipants.length) {
    tournamentRecord.participants = tournamentRecord.participants.concat(
      ...newParticipants
    );

    if (topics.includes('addParticipants')) {
      addNotice({
        topic: 'addParticipants',
        payload: { participants: newParticipants },
      });
    }
  }

  if (modifiedParticipants.length && topics.includes('modifyParticipants')) {
    addNotice({
      topic: 'modifyParticipants',
      payload: { participants: modifiedParticipants },
    });
  }

  if (newParticipants.length || modifiedParticipants.length) {
    return SUCCESS;
  }
}
