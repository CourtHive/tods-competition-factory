import { getAvoidanceConflicts } from './getAvoidanceConflicts';

export function getSwapOptions({
  positionedParticipants,
  potentialDrawPositions,
  avoidanceConflicts,
  drawPositionGroups,
  isRoundRobin,
}) {
  return avoidanceConflicts
    .map((conflict) => {
      const drawPositions = conflict.map((c) => c.drawPosition);
      const moveableParticipants = conflict.filter((placedParticipant) =>
        potentialDrawPositions.includes(placedParticipant.drawPosition)
      );
      return moveableParticipants
        .map((moveableParticipant) => {
          const possibleDrawPositions = potentialDrawPositions.filter(
            (position) => !drawPositions?.includes(position)
          );

          const possibleDrawPositionsNoConflict = possibleDrawPositions.filter(
            (possibleDrawPosition) => {
              const potentialOpponentDrawPosition = drawPositionGroups
                .find((pair) => pair.includes(possibleDrawPosition))
                .find((drawPosition) => drawPosition !== possibleDrawPosition);
              const potentialOpponent = positionedParticipants.find(
                (placement) =>
                  placement.drawPosition === potentialOpponentDrawPosition
              );
              const possibleDrawPositionGroup = [
                moveableParticipant,
                potentialOpponent,
              ];
              const conflictPotential = getAvoidanceConflicts({
                isRoundRobin,
                groupedParticipants: [possibleDrawPositionGroup],
              });
              const swappedParticipant = positionedParticipants.find(
                (placement) => placement.drawPosition === possibleDrawPosition
              );
              const possibleExistingOpponentGroup = [
                swappedParticipant,
                potentialOpponent,
              ];
              const existingOpponentConflictPotential = getAvoidanceConflicts({
                isRoundRobin,
                groupedParticipants: [possibleExistingOpponentGroup],
              });
              return (
                !conflictPotential.length &&
                !existingOpponentConflictPotential.length
              );
            }
          );

          if (possibleDrawPositionsNoConflict.length) {
            return {
              drawPosition: moveableParticipant.drawPosition,
              possibleDrawPositions: possibleDrawPositionsNoConflict,
            };
          }

          return undefined;
        })
        .filter(Boolean);
    })
    .flat(1);
}
