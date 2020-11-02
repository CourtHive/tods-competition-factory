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
  if (!penaltyType) return { error: 'Missing penaltyType' };
  if (!participantId) return { error: 'Missing participantId' };

  const participants = tournamentRecord?.participants;
  const participant = participants.find(
    participant => participant.participantId === participantId
  );
  if (!participant) return { error: 'Participant not found ' };

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
  if (!participantId) return { error: 'Missing participantId' };
  if (!penaltyId) return { error: 'Missing penaltyId' };

  const participants = tournamentRecord?.participants;
  const participant = participants.find(
    participant => participant.participantId === participantId
  );
  if (!participant) return { error: 'Participant not found ' };

  let penaltyRemoved = false;
  participant.penalties = (participant.penalties || []).filter(penalty => {
    if (penalty.penaltyId === penaltyId && !penaltyRemoved)
      penaltyRemoved = true;
    return penalty.penaltyId !== penaltyId;
  });

  return penaltyRemoved ? SUCCESS : { error: 'Penalty not found ' };
}
