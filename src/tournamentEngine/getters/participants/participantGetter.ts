import { findParticipant } from '../../../global/functions/deducers/findParticipant';
import { makeDeepCopy } from '../../../utilities';

import { Participant } from '../../../types/tournamentFromSchema';
import {
  ErrorType,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

export function findTournamentParticipant({
  tournamentRecord,
  participantId,
}): { error?: ErrorType; participant?: Participant } {
  const participants = tournamentRecord.participants || [];
  const participant = participants.reduce((participant, candidate) => {
    return candidate.participantId === participantId ? candidate : participant;
  }, undefined);
  return { participant };
}

export function publicFindParticipant({
  tournamentRecord,
  policyDefinitions,
  convertExtensions,
  participantId,
  personId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (typeof participantId !== 'string' && typeof personId !== 'string')
    return { error: MISSING_VALUE };

  const tournamentParticipants = tournamentRecord.participants || [];
  const participant = findParticipant({
    tournamentParticipants,
    policyDefinitions,
    participantId,
    personId,
  });
  return { participant: makeDeepCopy(participant, convertExtensions, true) };
}
