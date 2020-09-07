import { findTournamentParticipant } from 'competitionFactory/tournamentEngine/getters/participantGetter';
import { SIGNED_IN, SIGN_IN_STATUS } from 'competitionFactory/constants/participantConstants';

export function getParticipantSignInStatus({tournamentRecord, participantId}) {
  const {participant} = findTournamentParticipant({tournamentRecord, participantId});
  if (participant && Array.isArray(participant.timeItems)) {
    const signInStatusItems = participant.timeItems
      .filter(timeItem => timeItem.itemSubject === SIGN_IN_STATUS)
      .filter(timeItem => timeItem.timeStamp)
      .sort((a, b) => new Date(a.timeStamp || undefined) - new Date(b.timeStamp || undefined));
    const latestStatus = signInStatusItems[signInStatusItems.length - 1];
    const signedIn = (latestStatus && latestStatus.itemValue === SIGNED_IN);
    return signedIn;
  }
}