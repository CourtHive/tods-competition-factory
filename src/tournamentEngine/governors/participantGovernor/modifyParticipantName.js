import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { makeDeepCopy } from '../../../utilities';

import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  MISSING_VALUE,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyParticipantName({
  tournamentRecord,
  participantId,
  participantName,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  if (!participantName)
    return { error: MISSING_VALUE, message: 'Missing particpantName' };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  participant.participantName = participantName;
  if (participant.name) participant.name = participantName; // legacy support

  return Object.assign({}, SUCCESS, { participant: makeDeepCopy(participant) });
}
