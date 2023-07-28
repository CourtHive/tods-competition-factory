import { addNotice, getTopics } from '../../../global/state/globalState';
import { getParticipantId } from '../../../global/functions/extractors';
import { hasParticipantId } from '../../../global/functions/filters';
import { deepMerge } from '../../../utilities/deepMerge';

import { MISSING_TOURNAMENT_RECORD } from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  ADD_PARTICIPANTS,
  MODIFY_PARTICIPANTS,
} from '../../../constants/topicConstants';

export function mergeParticipants({
  tournamentRecord,
  participants: incomingParticipants = [],
  arraysToMerge,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!tournamentRecord.participants) tournamentRecord.participants = [];

  const incomingIdMap = Object.assign(
    ...incomingParticipants
      .filter(hasParticipantId)
      .map((p) => ({ [p.participantId]: p }))
  );

  // check for overlap with existing players, add any newly retrieved attributes to existing
  const modifiedParticipants = [];
  tournamentRecord.participants = tournamentRecord.participants.map(
    (participant) => {
      if (incomingIdMap[participant.participantId]) {
        const mergedParticipant = deepMerge(
          participant,
          incomingIdMap[participant.participantId],
          arraysToMerge
        );
        modifiedParticipants.push(mergedParticipant);
        return mergedParticipant;
      } else {
        return participant;
      }
    }
  );

  const existingParticipantIds =
    tournamentRecord.participants.map(getParticipantId);
  const newParticipants = incomingParticipants.filter(
    ({ participantId }) => !existingParticipantIds.includes(participantId)
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
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: modifiedParticipants,
      },
    });
  }

  if (newParticipants.length || modifiedParticipants.length) {
    return { ...SUCCESS };
  }
}
