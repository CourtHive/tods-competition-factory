import { getAvoidanceConflicts } from './getAvoidanceConflicts';

function getPotentialOpponentDrawPosition(drawPositionGroups: any[], possibleDrawPosition: any): any {
  const pair = drawPositionGroups.find((pair) => pair.includes(possibleDrawPosition));
  if (!pair) return undefined;
  return pair.find((drawPosition) => drawPosition !== possibleDrawPosition);
}

function findParticipantByDrawPosition(positionedParticipants: any[], drawPosition: any): any {
  return positionedParticipants.find((placement) => placement.drawPosition === drawPosition);
}

function hasNoConflict({
  moveableParticipant,
  possibleDrawPosition,
  positionedParticipants,
  drawPositionGroups,
  isRoundRobin,
  getAvoidanceConflicts,
}: {
  moveableParticipant: any;
  possibleDrawPosition: any;
  positionedParticipants: any[];
  drawPositionGroups: any[];
  isRoundRobin: boolean;
  getAvoidanceConflicts: (params: { isRoundRobin: boolean; groupedParticipants: any[][] }) => any[];
}): boolean {
  const potentialOpponentDrawPosition = getPotentialOpponentDrawPosition(drawPositionGroups, possibleDrawPosition);
  const potentialOpponent = findParticipantByDrawPosition(positionedParticipants, potentialOpponentDrawPosition);
  const possibleDrawPositionGroup = [moveableParticipant, potentialOpponent];
  const conflictPotential = getAvoidanceConflicts({
    isRoundRobin,
    groupedParticipants: [possibleDrawPositionGroup],
  });
  const swappedParticipant = findParticipantByDrawPosition(positionedParticipants, possibleDrawPosition);
  const possibleExistingOpponentGroup = [swappedParticipant, potentialOpponent];
  const existingOpponentConflictPotential = getAvoidanceConflicts({
    isRoundRobin,
    groupedParticipants: [possibleExistingOpponentGroup],
  });
  return !conflictPotential.length && !existingOpponentConflictPotential.length;
}

export function getSwapOptions({
  positionedParticipants,
  potentialDrawPositions,
  drawPositionGroups,
  avoidanceConflicts,
  isRoundRobin,
}) {
  return avoidanceConflicts.flatMap((conflict) => {
    const drawPositions = conflict.map((c) => c.drawPosition);
    const moveableParticipants = conflict.filter((placedParticipant) =>
      potentialDrawPositions.includes(placedParticipant.drawPosition),
    );
    return moveableParticipants
      .map((moveableParticipant) => {
        const possibleDrawPositions = potentialDrawPositions.filter((position) => !drawPositions?.includes(position));

        const possibleDrawPositionsNoConflict = possibleDrawPositions.filter((possibleDrawPosition) =>
          hasNoConflict({
            moveableParticipant,
            possibleDrawPosition,
            positionedParticipants,
            drawPositionGroups,
            isRoundRobin,
            getAvoidanceConflicts,
          }),
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
  });
}
