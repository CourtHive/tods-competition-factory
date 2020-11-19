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

  relevantParticipants.forEach(participant => {
    if (!participant.penalties) participant.penalties = [];
    participant.penalties.push(penaltyItem);
  });

  return SUCCESS;
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
  participants.forEach(participant => {
    participant.penalties = (participant.penalties || []).filter(penalty => {
      if (penalty.penaltyId === penaltyId && !penaltyRemoved)
        penaltyRemoved = true;
      return penalty.penaltyId !== penaltyId;
    });
  });

  return penaltyRemoved ? SUCCESS : { error: PENALTY_NOT_FOUND };
}

export function getTournamentPenalties({ tournamentRecord }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  const participants = tournamentRecord?.participants || [];
  const penalties = participants.reduce((participant, penalties) => {
    (participant.penalties || []).forEach(penalty => {
      const { penaltyId } = penalty || {};
      penalties[penaltyId] = penalty;
    });
    return penalties;
  }, {});

  return { penalties: Object.values(penalties) };
}

export function editPenalty({ tournamentRecord, penaltyId, modifications }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants || [];

  const validAttributes = Object.keys(penaltyTemplate()).filter(
    attribute => attribute !== 'penaltyId'
  );

  let penaltyEdited = false;
  participants.forEach(participant => {
    participant.penalties = (participant.penalties || [])
      .filter(penalty => penalty.penaltyId === penaltyId)
      .forEach(penalty => {
        if (!validAttributes.length) return { error: NO_VALID_ATTRIBUTES };
        if (!penaltyEdited) penaltyEdited = true;

        validAttributes.forEach(attribute =>
          Object.assign(penalty, { [attribute]: modifications[attribute] })
        );
      });
  });

  return penaltyEdited ? SUCCESS : { error: PENALTY_NOT_FOUND };
}
