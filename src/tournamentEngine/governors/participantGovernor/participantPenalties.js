import penaltyTemplate from '../../generators/penaltyTemplate';

import {
  PENALTY_NOT_FOUND,
  MISSING_PENALTY_ID,
  MISSING_PENALTY_TYPE,
  PARTICIPANT_NOT_FOUND,
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  NO_VALID_ATTRIBUTES,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

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
  penaltyType,
  matchUpId,
  notes,

  createdAt,

  refereeParticipantId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantIds) return { error: MISSING_PARTICIPANT_ID };
  if (!penaltyType) return { error: MISSING_PENALTY_TYPE };

  const participants = tournamentRecord?.participants || [];
  const relevantParticipants = participants.filter(participant =>
    participantIds.includes(participant.participantId)
  );
  if (!relevantParticipants.length) return { error: PARTICIPANT_NOT_FOUND };

  const penaltyItem = Object.assign(penaltyTemplate(), {
    refereeParticipantId,
    penaltyType,
    matchUpId,
    notes,

    createdAt,
  });

  const { penaltyId } = penaltyItem;

  relevantParticipants.forEach(participant => {
    if (!participant.penalties) participant.penalties = [];
    participant.penalties.push(penaltyItem);
  });

  return Object.assign({}, SUCCESS, { penaltyId });
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

  let penaltyRemoved = false;
  let removedPenalty;
  participants.forEach(participant => {
    participant.penalties = (participant.penalties || []).filter(penalty => {
      if (penalty.penaltyId === penaltyId && !penaltyRemoved) {
        removedPenalty = penalty;
        penaltyRemoved = true;
      }
      return penalty.penaltyId !== penaltyId;
    });
  });

  return removedPenalty
    ? Object.assign({}, SUCCESS, { penalty: removedPenalty })
    : { error: PENALTY_NOT_FOUND };
}

export function getTournamentPenalties({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const participants = tournamentRecord?.participants || [];
  const allPenalties = participants.reduce((penalties, participant) => {
    const { participantId } = participant;
    (participant.penalties || []).forEach(penalty => {
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
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants || [];

  const validAttributes = Object.keys(penaltyTemplate()).filter(
    attribute => attribute !== 'penaltyId'
  );
  if (!validAttributes.length) return { error: NO_VALID_ATTRIBUTES };

  let updatedPenalty;
  participants.forEach(participant => {
    participant.penalties = (participant.penalties || []).map(penalty => {
      if (penalty.penaltyId === penaltyId) {
        validAttributes.forEach(attribute =>
          Object.assign(penalty, { [attribute]: modifications[attribute] })
        );

        if (!updatedPenalty) updatedPenalty = penalty;
      }

      return penalty;
    });
  });

  return updatedPenalty
    ? Object.assign({}, SUCCESS, { penalty: updatedPenalty })
    : { error: PENALTY_NOT_FOUND };
}
