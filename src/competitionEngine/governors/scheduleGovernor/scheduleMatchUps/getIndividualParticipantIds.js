import { DOUBLES } from '../../../../constants/matchUpTypes';

export function getIndividualParticipantIds(matchUp) {
  const { sides, matchUpType } = matchUp || {};
  return (sides || [])
    .map((side) => {
      const potentialIndividualParticipantIds = matchUp.potentialParticipants
        ?.length
        ? matchUp.potentialParticipants.flat().map((participant) => {
            return matchUpType === DOUBLES
              ? participant?.individualParticipantIds || []
              : participant.participantId;
          })
        : [];
      const individualParticipantIds =
        matchUpType === DOUBLES
          ? side?.participant?.individualParticipantIds || []
          : side?.participantId
          ? [side.participantId]
          : [];
      return individualParticipantIds.concat(potentialIndividualParticipantIds);
    })
    .flat();
}
