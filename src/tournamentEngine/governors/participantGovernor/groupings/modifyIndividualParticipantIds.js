import { removeIndividualParticipantIds } from './removeIndividualParticipantIds';
import { addIndividualParticipantIds } from './addIndividualParticipantIds';
import { addNotice, getTopics } from '../../../../global/globalState';

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
} from '../../../../constants/participantTypes';
import { MODIFY_PARTICIPANTS } from '../../../../constants/topicConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} groupingParticipantId - grouping participant to which participantIds are to be added
 * @param {string[]} individualParticipantIds - new value for individualParticipantIds array
 *
 */
export function modifyIndividualParticipantIds({
  tournamentRecord,
  groupingParticipantId,
  individualParticipantIds,
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

  // integrity chck to insure only individuals can be added to groupings
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
    tournamentRecord,
    groupingParticipantId,
    individualParticipantIds: individualParticipantIdsToAdd,
  });
  if (addResult.error) return addResult;

  const removeResult = removeIndividualParticipantIds({
    tournamentRecord,
    groupingParticipantId,
    individualParticipantIds: individualParticipantIdsToRemove,
  });
  if (removeResult.error) return removeResult;

  const { topics } = getTopics();
  if (topics.includes(MODIFY_PARTICIPANTS)) {
    const updatedParticipant = tournamentParticipants.find(
      ({ participantId }) => participantId === groupingParticipantId
    );

    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: [updatedParticipant] },
    });
  }

  return Object.assign({}, addResult, removeResult);
}
