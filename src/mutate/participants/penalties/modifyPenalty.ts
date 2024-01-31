import { addNotice } from '@Global/state/globalState';

import penaltyTemplate from '@Assemblies/generators/templates/penaltyTemplate';
import { MODIFY_PARTICIPANTS } from '@Constants/topicConstants';
import { SUCCESS } from '@Constants/resultConstants';
import {
  PENALTY_NOT_FOUND,
  MISSING_PENALTY_ID,
  MISSING_TOURNAMENT_RECORD,
  NO_VALID_ATTRIBUTES,
  INVALID_VALUES,
  ErrorType,
  MISSING_TOURNAMENT_RECORDS,
} from '@Constants/errorConditionConstants';
import { Participant, Penalty, Tournament } from '@Types/tournamentTypes';

export function modifyPenalty(params) {
  const { tournamentRecords } = params;
  if (typeof tournamentRecords !== 'object' || !Object.keys(tournamentRecords).length)
    return { error: MISSING_TOURNAMENT_RECORDS };

  for (const tournamentRecord of Object.values(tournamentRecords)) {
    const result = penaltyModify({ ...params, tournamentRecord });
    if (result.error && result.error !== PENALTY_NOT_FOUND) return result;
    if (result.success) return result;
  }

  return { error: PENALTY_NOT_FOUND };
}

type ModifyPenaltyArgs = {
  tournamentRecord: Tournament;
  modifications: { [key: string]: any };
  penaltyId;
  string;
};

function penaltyModify({ tournamentRecord, modifications, penaltyId }: ModifyPenaltyArgs): {
  modifications?: any;
  error?: ErrorType;
  success?: boolean;
  penalty?: Penalty;
} {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!modifications) return { error: INVALID_VALUES, modifications };
  if (!penaltyId) return { error: MISSING_PENALTY_ID };

  const participants = tournamentRecord?.participants ?? [];

  const validAttributes = Object.keys(penaltyTemplate()).filter((attribute) => attribute !== 'penaltyId');

  const validModificationAttributes = Object.keys(modifications).filter((attribute) =>
    validAttributes.includes(attribute),
  );

  if (!validModificationAttributes.length) return { error: NO_VALID_ATTRIBUTES };

  let updatedPenalty;
  const modifiedParticipants: Participant[] = [];
  participants.forEach((participant) => {
    let participantModified = false;
    participant.penalties = (participant.penalties ?? []).map((penalty) => {
      if (penalty.penaltyId === penaltyId) {
        participantModified = true;
        validModificationAttributes.forEach((attribute) =>
          Object.assign(penalty, { [attribute]: modifications[attribute] }),
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
      payload: {
        tournamentId: tournamentRecord.tournamentId,
        participants: modifiedParticipants,
      },
    });
  }

  return updatedPenalty ? { ...SUCCESS, penalty: updatedPenalty } : { error: PENALTY_NOT_FOUND };
}
