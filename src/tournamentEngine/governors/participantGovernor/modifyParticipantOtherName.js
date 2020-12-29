import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import { makeDeepCopy } from '../../../utilities';

import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

export function modifyParticipantOtherName({
  tournamentRecord,
  participantId,
  participantOtherName,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });
  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  participant.participantOtherName = participantOtherName;

  return Object.assign({}, SUCCESS, { participant: makeDeepCopy(participant) });
}
