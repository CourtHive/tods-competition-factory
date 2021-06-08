import { DOUBLES } from '../../../../constants/matchUpTypes';

export function getIndividualParticipantIds(matchUp) {
  const { sides, matchUpType } = matchUp || {};
  return (sides || [])
    .map((side) => {
      return matchUpType === DOUBLES
        ? side?.participant?.individualParticipantIds || []
        : side?.participantId
        ? [side.participantId]
        : [];
    })
    .flat();
}
