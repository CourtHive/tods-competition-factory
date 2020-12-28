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

  if (Array.isArray(participant.timeItems)) {
    const signInStatusItems = participant.timeItems
      .filter((timeItem) => timeItem.itemType === SIGN_IN_STATUS)
      .filter((timeItem) => timeItem.createdAt)
      .sort(
        (a, b) =>
          new Date(a.createdAt || undefined) -
          new Date(b.createdAt || undefined)
      );
    const latestStatus = signInStatusItems[signInStatusItems.length - 1];
    const signedIn = latestStatus && latestStatus.itemValue === SIGNED_IN;
    return signedIn && SIGNED_IN;
  }
}
