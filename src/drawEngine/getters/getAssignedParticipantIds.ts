import { getPositionAssignments } from './positionsGetter';
import { extractAttributes } from '../../utilities';

// build up an array of participantIds which are assigned positions in structures
// optionally filter to included only specified stages

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
        ? positionAssignments.map(extractAttributes('participantId'))
        : [];
    })
    .flat();
}
