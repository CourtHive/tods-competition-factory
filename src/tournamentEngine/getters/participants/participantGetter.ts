import { findParticipant } from '../../../acquire/findParticipant';
import { makeDeepCopy } from '../../../utilities';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
} from '../../../constants/errorConditionConstants';

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
