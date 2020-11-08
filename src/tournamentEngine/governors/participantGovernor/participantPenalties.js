import {
  PARTICIPANT_NOT_FOUND,
  MISSING_PARTICIPANT_ID,
  MISSING_PENALTY_TYPE,
  MISSING_PENALTY_ID,
  PENALTY_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import { UUID } from '../../../utilities';

export function addParticipantPenalty({
  tournamentRecord,
  participantId,
  penaltyType,
  matchUpId,
  notes,

  createdAt,

  refereeParticipantId,
}) {
  if (!penaltyType) return { error: MISSING_PENALTY_TYPE };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const participants = tournamentRecord?.participants;
  const participant = participants.find(
    participant => participant.participantId === participantId
  );
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  if (!participant.penalties) participant.penalties = [];

  const penaltyItem = {
    refereeParticipantId,
    penaltyId: UUID(),
    penaltyType,
    matchUpId,
    notes,

    createdAt,
  };

  participant.penalties.push(penaltyItem);

  return SUCCESS;
}

export function removeParticipantPenalty({
  tournamentRecord,
  participantId,
  penaltyId,
}) {
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants;
  const participant = participants.find(
    participant => participant.participantId === participantId
  );
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  let penaltyRemoved = false;
  participant.penalties = (participant.penalties || []).filter(penalty => {
    if (penalty.penaltyId === penaltyId && !penaltyRemoved)
      penaltyRemoved = true;
    return penalty.penaltyId !== penaltyId;
  });

  return penaltyRemoved ? SUCCESS : { error: PENALTY_NOT_FOUND };
}
