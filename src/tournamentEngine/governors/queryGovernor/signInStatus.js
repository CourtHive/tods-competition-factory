import { findTournamentParticipant } from '../../getters/participants/participantGetter';
import {
  SIGNED_IN,
  SIGN_IN_STATUS,
} from '../../../constants/participantConstants';
import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { getTimeItem } from './timeItems';

export function getParticipantSignInStatus({
  tournamentRecord,
  participantId,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  const { timeItem } = getTimeItem({
    element: participant,
    itemType: SIGN_IN_STATUS,
  });

  return timeItem && timeItem.itemValue === SIGNED_IN && SIGNED_IN;
}
