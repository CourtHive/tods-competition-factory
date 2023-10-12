import { DOUBLES } from '../../../constants/eventConstants';

const DEFAULT_RATING = 0;

export function getSideRatings({
  tournamentParticipants,
  adHocRatings,
  eventType,
  pairing,
}) {
  return pairing.split('|').map((participantId) => {
    if (eventType === DOUBLES) {
      const individualParticipantIds = tournamentParticipants?.find(
        (participant) => participant.participantId === participantId
      )?.individualParticipantIds;
      return !individualParticipantIds
        ? DEFAULT_RATING * 2
        : individualParticipantIds?.map(
            (participantId) => adHocRatings[participantId || DEFAULT_RATING]
          );
    } else {
      return adHocRatings[participantId] || DEFAULT_RATING;
    }
  });
}
