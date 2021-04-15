import { addExtension } from '../tournamentGovernor/addRemoveExtensions';
import penaltyTemplate from '../../generators/penaltyTemplate';
import { addNotice } from '../../../global/globalState';

import {
  PENALTY_NOT_FOUND,
  MISSING_PENALTY_ID,
  MISSING_PENALTY_TYPE,
  PARTICIPANT_NOT_FOUND,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  NO_VALID_ATTRIBUTES,
  INVALID_VALUES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { MODIFY_PARTICIPANTS } from '../../../constants/topicConstants';

/**
 *
 * @param {string[]} participantIds - ids of participants receiving the panalty
 * @param {string} penaltyType - enum
 * @param {string} matchUpId - optional - matchUp in which penalty occurred
 *
 */
export function addPenalty({
  tournamentRecord,
  participantIds,
  penaltyCode,
  penaltyType,
  penaltyId,
  matchUpId,
  notes,

  extensions,
  issuedAt,

  refereeParticipantId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds) return { error: MISSING_PARTICIPANT_ID };
  if (!penaltyType) return { error: MISSING_PENALTY_TYPE };

  // TODO: add penalty timeItem to matchUp.timeItems[]

  const participants = tournamentRecord?.participants || [];
  const relevantParticipants = participants.filter((participant) =>
    participantIds.includes(participant.participantId)
  );
  if (!relevantParticipants.length) return { error: PARTICIPANT_NOT_FOUND };

  const createdAt = new Date().toISOString();
  const penaltyItem = Object.assign(penaltyTemplate({ penaltyId }), {
    refereeParticipantId,
    penaltyCode,
    penaltyType,
    matchUpId,
    notes,

    issuedAt,
    createdAt,
  });

  if (Array.isArray(extensions)) {
    extensions.forEach((extension) =>
      addExtension({ element: penaltyItem, extension })
    );
  }

  relevantParticipants.forEach((participant) => {
    if (!participant.penalties) participant.penalties = [];
    participant.penalties.push(penaltyItem);
  });

  addNotice({
    topic: MODIFY_PARTICIPANTS,
    payload: { participants: relevantParticipants },
  });

  return Object.assign({}, SUCCESS, { penaltyId: penaltyItem.penaltyId });
}

/**
 *
 * @param {string} penaltyId
 *
 */
export function removePenalty({ tournamentRecord, penaltyId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants || [];
  const modifiedParticipants = [];

  let penaltyRemoved = false;
  let removedPenalty;
  participants.forEach((participant) => {
    let participantModified = false;
    participant.penalties = (participant.penalties || []).filter((penalty) => {
      if (penalty.penaltyId === penaltyId) {
        participantModified = true;
        if (!penaltyRemoved) {
          removedPenalty = penalty;
          penaltyRemoved = true;
        }
      }
      if (participantModified) modifiedParticipants.push(participant);
      return penalty.penaltyId !== penaltyId;
    });
  });

  if (removedPenalty) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: modifiedParticipants },
    });
  }

  return removedPenalty
    ? Object.assign({}, SUCCESS, { penalty: removedPenalty })
    : { error: PENALTY_NOT_FOUND };
}

export function getTournamentPenalties({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const participants = tournamentRecord?.participants || [];
  const allPenalties = participants.reduce((penalties, participant) => {
    const { participantId } = participant;
    (participant.penalties || []).forEach((penalty) => {
      const { penaltyId } = penalty || {};
      if (penalties[penaltyId]) {
        penalties[penaltyId].participants.push(participantId);
      } else {
        penalties[penaltyId] = Object.assign({}, penalty, {
          participantIds: [participantId],
        });
      }
    });
    return penalties;
  }, {});

  return { penalties: Object.values(allPenalties) };
}

export function modifyPenalty({ tournamentRecord, penaltyId, modifications }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!modifications) return { error: INVALID_VALUES, modifications };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants || [];

  const validAttributes = Object.keys(penaltyTemplate()).filter(
    (attribute) => attribute !== 'penaltyId'
  );

  const validModificationAttributes = Object.keys(
    modifications
  ).filter((attribute) => validAttributes.includes(attribute));

  if (!validModificationAttributes.length)
    return { error: NO_VALID_ATTRIBUTES };

  let updatedPenalty;
  const modifiedParticipants = [];
  participants.forEach((participant) => {
    let participantModified = false;
    participant.penalties = (participant.penalties || []).map((penalty) => {
      if (penalty.penaltyId === penaltyId) {
        participantModified = true;
        validModificationAttributes.forEach((attribute) =>
          Object.assign(penalty, { [attribute]: modifications[attribute] })
        );

        if (!updatedPenalty) updatedPenalty = penalty;
      }

      return penalty;
    });
    if (participantModified) modifiedParticipants.push(participant);
  });

  if (updatedPenalty) {
    addNotice({
      topic: MODIFY_PARTICIPANTS,
      payload: { participants: modifiedParticipants },
    });
  }

  return updatedPenalty
    ? Object.assign({}, SUCCESS, { penalty: updatedPenalty })
    : { error: PENALTY_NOT_FOUND };
}
