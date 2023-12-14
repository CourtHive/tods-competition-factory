import { extractAttributes, unique } from '../../utilities';
import { getPositionAssignments } from './positionsGetter';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { ResultType } from '../../global/functions/decorateResult';
import { SUCCESS } from '../../constants/resultConstants';
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
}: GetAssignedParticipantIdsArgs): ResultType & {
  assignedParticipantIds?: string[];
} {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  const stageStructures = (drawDefinition?.structures || []).filter(
    (structure) =>
      !stages?.length || (structure.stage && stages.includes(structure.stage))
  );
  const assignedParticipantIds = unique(
    stageStructures
      .map((structure) => {
        const { positionAssignments } = getPositionAssignments({
          structure,
        });
        return positionAssignments
          ? positionAssignments.map(extractAttributes('participantId'))
          : [];
      })
      .flat()
      .filter(Boolean)
  );

  return { ...SUCCESS, assignedParticipantIds };
}
