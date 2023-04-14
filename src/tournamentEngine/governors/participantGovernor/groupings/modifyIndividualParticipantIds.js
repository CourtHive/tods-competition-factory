import { removeIndividualParticipantIds } from './removeIndividualParticipantIds';
import { addIndividualParticipantIds } from './addIndividualParticipantIds';
import { addNotice, getTopics } from '../../../../global/state/globalState';

import { MODIFY_PARTICIPANTS } from '../../../../constants/topicConstants';
import {
  INVALID_PARTICIPANT_IDS,
  INVALID_PARTICIPANT_TYPE,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
} from '../../../../constants/errorConditionConstants';
import {
  GROUP,
  INDIVIDUAL,
  TEAM,
} from '../../../../constants/participantConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} groupingParticipantId - grouping participant to which participantIds are to be added
 * @param {string[]} individualParticipantIds - new value for individualParticipantIds array
 *
 */
export function modifyIndividualParticipantIds({
  individualParticipantIds,
  groupingParticipantId,
  tournamentRecord,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!groupingParticipantId || !individualParticipantIds)
    return { error: MISSING_VALUE };

  const tournamentParticipants = tournamentRecord.participants || [];

  const groupingParticipant = tournamentParticipants.find((participant) => {
    return participant.participantId === groupingParticipantId;
  });
  if (!groupingParticipant) return { error: PARTICIPANT_NOT_FOUND };

  if (![TEAM, GROUP].includes(groupingParticipant.participantType)) {
    return {
      error: INVALID_PARTICIPANT_TYPE,
      participantType: groupingParticipant.participantType,
    };
  }

  // integrity chck to ensure only individuals can be added to groupings
  const invalidParticipantIds = individualParticipantIds.filter(
    (participantId) => {
      const participant = tournamentParticipants.find(
        (tournamentParticipant) =>
          tournamentParticipant.participantId === participantId
      );
      return participant?.participantType !== INDIVIDUAL;
    }
  );
  if (invalidParticipantIds.length)
    return { error: INVALID_PARTICIPANT_IDS, invalidParticipantIds };

  const existingIndividualParticipantIds =
    groupingParticipant.individualParticipantIds || [];

  const individualParticipantIdsToAdd = individualParticipantIds.filter(
    (participantId) => {
      return !existingIndividualParticipantIds.includes(participantId);
    }
  );

  const individualParticipantIdsToRemove =
    existingIndividualParticipantIds.filter((participantId) => {
      return !individualParticipantIds.includes(participantId);
    });

  const addResult = addIndividualParticipantIds({
    individualParticipantIds: individualParticipantIdsToAdd,
    groupingParticipantId,
    tournamentRecord,
  });
  if (addResult.error) return addResult;

  const removeResult = removeIndividualParticipantIds({
    individualParticipantIds: individualParticipantIdsToRemove,
    groupingParticipantId,
    tournamentRecord,
  });
  if (removeResult.error) return removeResult;

  const { topics } = getTopics();
  if (topics.includes(MODIFY_PARTICIPANTS)) {
    const updatedParticipant = tournamentParticipants.find(
      ({ participantId }) => participantId === groupingParticipantId
    );

    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: [updatedParticipant],
      },
    });
  }

  return { ...addResult, ...removeResult };
}
