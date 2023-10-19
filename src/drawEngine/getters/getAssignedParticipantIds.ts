import { getPositionAssignments } from './positionsGetter';
import { extractAttributes } from '../../utilities';

import {
  DrawDefinition,
  StageTypeEnum,
} from '../../types/tournamentFromSchema';

// build up an array of participantIds which are assigned positions in structures
// optionally filter to included only specified stages

type GetAssignedParticipantIdsArgs = {
  drawDefinition: DrawDefinition;
  stages?: StageTypeEnum[];
};

export function getAssignedParticipantIds({
  drawDefinition,
  stages,
}: GetAssignedParticipantIdsArgs): string[] {
  const stageStructures = (drawDefinition?.structures || []).filter(
    (structure) =>
      !stages?.length || (structure.stage && stages.includes(structure.stage))
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
