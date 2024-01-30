import { findTournamentParticipant } from '../../acquire/findTournamentParticipant';
import { getTimeItem } from '../base/timeItems';

import {
  MISSING_PARTICIPANT_ID,
  MISSING_TOURNAMENT_RECORD,
  PARTICIPANT_NOT_FOUND,
} from '@Constants/errorConditionConstants';
import { SIGNED_IN, SIGN_IN_STATUS } from '@Constants/participantConstants';

export function getParticipantSignInStatus({ tournamentRecord, participantId }) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!participantId) return { error: MISSING_PARTICIPANT_ID };

  const { participant } = findTournamentParticipant({
    tournamentRecord,
    participantId,
  });

  if (!participant) return { error: PARTICIPANT_NOT_FOUND };

  const { timeItem } = getTimeItem({
    itemType: SIGN_IN_STATUS,
    element: participant,
  });

  return timeItem && timeItem.itemValue === SIGNED_IN && SIGNED_IN;
}
