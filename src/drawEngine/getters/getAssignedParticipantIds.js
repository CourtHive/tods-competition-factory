import { getPositionAssignments } from './positionsGetter';

// build up an array of participantIds which are assigned positions in structures
// disallow changing entryStatus to WITHDRAWN or UNPAIRED for assignedParticipants

export function getAssignedParticipantIds({ drawDefinition, stages }) {
  const stageStructures = (drawDefinition?.structures || []).filter(
    (structure) => !stages?.length || stages.includes(structure.stage)
  );
  return stageStructures
    .map((structure) => {
      const { positionAssignments } = getPositionAssignments({
        structure,
      });
      return positionAssignments
        .map(({ participantId }) => participantId)
        .filter((f) => f);
    })
    .flat();
}
