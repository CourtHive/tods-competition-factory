import { addNotice } from '@Global/state/globalState';

import { MODIFY_PARTICIPANTS } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  PENALTY_NOT_FOUND,
  MISSING_PENALTY_ID,
  MISSING_TOURNAMENT_RECORD,
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '@Constants/errorConditionConstants';
import { Participant, Penalty, Tournament } from '@Types/tournamentTypes';

export function removePenalty(params) {
  const { tournamentRecords } = params;
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyRemove({ ...params, tournamentRecord });
    if (result.error && result.error !== PENALTY_NOT_FOUND) return result;
  }

  return { ...SUCCESS };
}

type RemovePenaltyArgs = {
  tournamentRecord: Tournament;
  penaltyId: string;
};
function penaltyRemove({ tournamentRecord, penaltyId }: RemovePenaltyArgs): {
  error?: ErrorType;
  success?: boolean;
  penalty?: Penalty;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants ?? [];
  const modifiedParticipants: Participant[] = [];

  let penaltyRemoved = false;
  let removedPenalty;
  participants.forEach((participant) => {
    let participantModified = false;
    participant.penalties = (participant.penalties ?? []).filter((penalty) => {
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
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: modifiedParticipants,
      },
    });
  }

  return removedPenalty ? { ...SUCCESS, penalty: removedPenalty } : { error: PENALTY_NOT_FOUND };
}
