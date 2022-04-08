import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { modifyDrawNotice } from '../../notifications/drawNotifications';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { intersection } from '../../../utilities';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function setPositionAssignments({
  structurePositionAssignments,
  tournamentRecord,
  drawDefinition,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!Array.isArray(structurePositionAssignments))
    return { error: INVALID_VALUES };

  for (const structureAssignments of structurePositionAssignments) {
    const { structureId, positionAssignments } = structureAssignments;

    const result = findStructure({ drawDefinition, structureId });
    if (result.error) return result;
    const structure = result.structure;

    if (!structure) return { error: STRUCTURE_NOT_FOUND };
    if (structure.structures)
      return {
        error: INVALID_STRUCTURE,
        info: 'cannot be Round Robin group container',
      };

    const structureDrawPositions = structure.positionAssignments?.map(
      ({ drawPosition }) => drawPosition
    );
    const submittedDrawPositions = positionAssignments.map(
      ({ drawPosition }) => drawPosition
    );

    if (
      intersection(structureDrawPositions, submittedDrawPositions).length !==
      structureDrawPositions.length
    )
      return { error: INVALID_VALUES, info: 'drawPositions do not match' };

    const matchUpsMap = getMatchUpsMap({ drawDefinition });
    const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    });

    for (const assignment of positionAssignments) {
      const { drawPosition, participantId, bye, qualifier } = assignment;

      if (bye) {
        const result = assignDrawPositionBye({
          tournamentRecord,
          drawDefinition,
          drawPosition,
          matchUpsMap,
          structureId,
          structure,
        });
        if (result?.error) return result;
      } else if (qualifier) {
        positionAssignments.forEach((assignment) => {
          if (assignment.drawPosition === drawPosition) {
            assignment.qualifier = true;
            delete assignment.participantId;
            delete assignment.bye;
          }
        });
      } else if (participantId) {
        const result = assignDrawPosition({
          automaticPlacement: true,
          inContextDrawMatchUps,
          tournamentRecord,
          drawDefinition,
          participantId,
          drawPosition,
          matchUpsMap,
          structureId,
        });
        if (result?.error) return result;
      }
    }
  }

  const structureIds = structurePositionAssignments.map(
    ({ structureId }) => structureId
  );
  modifyDrawNotice({ drawDefinition, structureIds });

  return { ...SUCCESS };
}
