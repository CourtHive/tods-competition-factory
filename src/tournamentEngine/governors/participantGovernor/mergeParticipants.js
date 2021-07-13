import { addNotice, getTopics } from '../../../global/globalState';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ADD_PARTICIPANTS,
  MODIFY_PARTICIPANTS,
} from '../../../constants/topicConstants';

export function mergeParticipants({
  tournamentRecord,
  participants: incomingParticipants = [],
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
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

    if (topics.includes(ADD_PARTICIPANTS)) {
      addNotice({
        topic: ADD_PARTICIPANTS,
        payload: { participants: newParticipants },
      });
    }
  }

  if (modifiedParticipants.length && topics.includes(MODIFY_PARTICIPANTS)) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: modifiedParticipants },
    });
  }

  if (newParticipants.length || modifiedParticipants.length) {
    return SUCCESS;
  }
}
