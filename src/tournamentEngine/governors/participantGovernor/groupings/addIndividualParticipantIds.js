import { removeParticipantIdsFromAllTeams } from './removeIndividualParticipantIds';
import { addNotice, getTopics } from '../../../../global/state/globalState';
import { makeDeepCopy } from '../../../../utilities';

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
import { SUCCESS } from '../../../../constants/resultConstants';
import { MODIFY_PARTICIPANTS } from '../../../../constants/topicConstants';

/**
 *
 * @param {object} tournamentRecord - passed in automatically by tournamentEngine
 * @param {string} groupingParticipantId - grouping participant to which participantIds are to be added
 * @param {string[]} individualParticipantIds - individual participantIds to be added to grouping participant
 * @param {boolean} removeFromOtherTeams - whether or not to remove from other teams
 *
 */
export function addIndividualParticipantIds({
  tournamentRecord,
  groupingParticipantId,
  individualParticipantIds,
  removeFromOtherTeams,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!groupingParticipantId || !individualParticipantIds)
    return { error: MISSING_VALUE };

  const tournamentParticipants = tournamentRecord.participants || [];
  const groupingParticipant = tournamentParticipants.find(
    (participant) => participant.participantId === groupingParticipantId
  );
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

  if (!groupingParticipant.individualParticipantIds)
    groupingParticipant.individualParticipantIds = [];
  const existingIndividualParticipantIds =
    groupingParticipant.individualParticipantIds;

  const participantIdsToAdd = individualParticipantIds.filter(
    (participantId) => {
      const participantIsMember =
        existingIndividualParticipantIds.includes(participantId);
      return !participantIsMember;
    }
  );

  if (participantIdsToAdd.length) {
    if (removeFromOtherTeams) {
      removeParticipantIdsFromAllTeams({
        tournamentRecord,
        individualParticipantIds: participantIdsToAdd,
      });
    }
    groupingParticipant.individualParticipantIds =
      groupingParticipant.individualParticipantIds.concat(
        ...participantIdsToAdd
      );
  }

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

  return {
    ...SUCCESS,
    groupingParticipant: makeDeepCopy(groupingParticipant),
    added: participantIdsToAdd.length,
  };
}
