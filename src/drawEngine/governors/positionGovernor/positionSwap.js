import { removeDrawPositionAssignment } from '../../../tournamentEngine/governors/eventGovernor/drawDefinitions/removeDrawPositionAssignment';
import { conditionallyDisableLinkPositioning } from './conditionallyDisableLinkPositioning';
import { getAllStructureMatchUps } from '../../getters/getMatchUps/getAllStructureMatchUps';
import { assignDrawPositionBye } from './byePositioning/assignDrawPositionBye';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';
import { addPositionActionTelemetry } from './addPositionActionTelemetry';
import { findStructure } from '../../getters/findStructure';
import { assignDrawPosition } from './positionAssignment';
import { cleanupLineUps } from './cleanupLineUps';
import { makeDeepCopy } from '../../../utilities';
import {
  modifyDrawNotice,
  modifyPositionAssignmentsNotice,
} from '../../notifications/drawNotifications';

import { CONTAINER } from '../../../constants/drawDefinitionConstants';
import { TEAM_MATCHUP } from '../../../constants/matchUpTypes';
import { TEAM_EVENT } from '../../../constants/eventConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import { updateSideLineUp } from './updateSideLineUp';

export function swapDrawPositionAssignments({
  tournamentRecord,
  drawDefinition,
  drawPositions,
  structureId,
  event,
}) {
  const stack = 'swapDrawPositionAssignments';
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };
  if (drawPositions?.length !== 2) {
    return { error: INVALID_VALUES, drawPositions };
  }

  let matchUpsMap = getMatchUpsMap({ drawDefinition });

  const { matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
    includeByeMatchUps: true,
    inContext: true,
    drawDefinition,
    matchUpsMap,
  });

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  let result;
  if (structure.structureType === CONTAINER) {
    // { structureType: CONTAINER } indicates that the swap is within a ROUND ROBIN structure
    result = roundRobinSwap({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      drawPositions,
      matchUpsMap,
      structure,
      event,
    });
  } else {
    // if not a CONTAINER then swap occurs within elimination structure
    result = eliminationSwap({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      drawPositions,
      matchUpsMap,
      structure,
      event,
    });
  }

  if (result.error) return result;

  conditionallyDisableLinkPositioning({ structure, drawPositions });
  const positionAction = {
    name: 'swapDrawPositionAssignments',
    drawPositions,
    structureId,
  };
  addPositionActionTelemetry({ drawDefinition, positionAction });

  modifyPositionAssignmentsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    drawDefinition,
    source: stack,
    structure,
    event,
  });

  if (event.eventType === TEAM_EVENT) {
    // update side lineUps for drawPositions that were swapped
    const inContextTargetMatchUps = getAllStructureMatchUps({
      matchUpFilters: { matchUpTypes: [TEAM_MATCHUP] },
      inContext: true,
      structure,
    }).matchUps.filter((matchUp) =>
      matchUp.drawPositions?.some((drawPosition) =>
        drawPositions.includes(drawPosition)
      )
    );
    const structureMatchUps = getAllStructureMatchUps({
      structure,
      matchUpFilters: { matchUpTypes: [TEAM_MATCHUP] },
    }).matchUps;

    inContextTargetMatchUps.forEach((inContextTargetMatchUp) => {
      (inContextTargetMatchUp.sides || []).forEach((inContextSide) => {
        const drawPosition = inContextSide?.drawPosition;
        if (drawPositions.includes(drawPosition)) {
          const teamParticipantId = inContextSide.participantId;
          const matchUp = structureMatchUps.find(
            ({ matchUpId }) => matchUpId === inContextTargetMatchUp.matchUpId
          );
          const drawPositionSideIndex = inContextTargetMatchUp?.sides?.reduce(
            (index, side, i) =>
              side.drawPosition === drawPosition ? i : index,
            undefined
          );

          updateSideLineUp({
            inContextTargetMatchUp,
            drawPositionSideIndex,
            teamParticipantId,
            tournamentRecord,
            drawDefinition,
            matchUp,
            event,
          });
        }
      });
    });
  }
  modifyDrawNotice({ drawDefinition, structureIds: [structureId] });

  return { ...SUCCESS };
}

function eliminationSwap({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  drawPositions,
  matchUpsMap,
  structure,
  event,
}) {
  // if not a CONTAINER then swap occurs within elimination structure
  const assignments = structure?.positionAssignments.filter((assignment) =>
    drawPositions?.includes(assignment.drawPosition)
  );

  if (!assignments) {
    return {
      error: INVALID_VALUES,
      structure,
      info: 'Missing positionAssignments',
    };
  }

  // if both positions are BYE no need to do anything
  if (assignments.filter(({ bye }) => bye).length === 2) return { ...SUCCESS };

  // if both positions are qualifier no need to do anything
  if (assignments.filter(({ qualifier }) => qualifier).length === 2)
    return { ...SUCCESS };

  const isByeSwap = assignments.some(({ bye }) => bye);

  if (isByeSwap) {
    return swapParticipantIdWithBYE({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      assignments,
      matchUpsMap,
      structure,
      event,
    });
  } else {
    return eliminationParticipantSwap({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      assignments,
      matchUpsMap,
      structure,
      event,
    });
  }
}

function swapParticipantIdWithBYE({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  assignments,
  matchUpsMap,
  structure,
  event,
}) {
  // remove the assignment that has a participantId
  const originalByeAssignment = assignments.find(({ bye }) => bye);
  const originalParticipantIdAssignment = assignments.find(
    ({ participantId }) => participantId
  );
  const originalByeDrawPosition = originalByeAssignment.drawPosition;
  const { participantId, drawPosition: originalParticipantIdDrawPosition } =
    originalParticipantIdAssignment;
  const { structureId } = structure;

  // remove both drawPosition assignments
  let result = removeDrawPositionAssignment({
    drawPosition: originalByeDrawPosition,
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    matchUpsMap,
  });
  if (result.error) return result;

  result = removeDrawPositionAssignment({
    drawPosition: originalParticipantIdDrawPosition,
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    matchUpsMap,
  });
  if (result.error) return result;

  result = assignDrawPositionBye({
    drawPosition: originalParticipantIdDrawPosition,
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    matchUpsMap,
    event,
  });

  // replace the original byeAssignment with participantId
  result = assignDrawPosition({
    drawPosition: originalByeDrawPosition,
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    structureId,
    participantId,
    matchUpsMap,
    event,
  });
  if (result.error) return result;

  return { ...SUCCESS };
}

function eliminationParticipantSwap({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  assignments,
  matchUpsMap,
  structure,
  event,
}) {
  // preserves order of drawPositions in original positionAssignments array
  // while insuring that all attributes are faithfully copied over and only drawPosition is swapped
  const newAssignments = Object.assign(
    {},
    ...assignments.map((assignment, index) => {
      const { drawPosition } = assignment;
      const newAssignment = { ...assignments[1 - index], drawPosition };
      return { [drawPosition]: newAssignment };
    })
  );

  structure.positionAssignments = structure.positionAssignments.map(
    (assignment) => newAssignments[assignment.drawPosition] || assignment
  );

  cleanupLineUps({
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    matchUpsMap,
    assignments,
    structure,
    event,
  });

  return { ...SUCCESS };
}

function roundRobinSwap({
  inContextDrawMatchUps,
  tournamentRecord,
  drawDefinition,
  drawPositions,
  matchUpsMap,
  structure,
  event,
}) {
  const assignments = structure.structures?.reduce((assignments, structure) => {
    const structureAssignments = structure?.positionAssignments.filter(
      (assignment) => drawPositions?.includes(assignment.drawPosition)
    );
    if (structureAssignments) assignments.push(...structureAssignments);
    return assignments;
  }, []);

  // if both positions are BYE no need to do anything
  if (assignments.filter(({ bye }) => bye).length === 2) return { ...SUCCESS };

  // if both positions are QUALIFIER no need to do anything
  if (assignments.filter(({ qualifier }) => qualifier).length === 2)
    return { ...SUCCESS };

  cleanupLineUps({
    inContextDrawMatchUps,
    tournamentRecord,
    drawDefinition,
    matchUpsMap,
    assignments,
    structure,
    event,
  });

  const isByeSwap = assignments.some(({ bye }) => bye);

  if (isByeSwap) {
    swapParticipantIdWithBYE({
      inContextDrawMatchUps,
      tournamentRecord,
      drawDefinition,
      assignments,
      matchUpsMap,
      structure,
      event,
    });
  } else {
    // for Round Robin the positionAssignments are distributed across structures
    // so the strategy of creating a new positionAssignments array won't work
    const originalAssignments = makeDeepCopy(assignments, false, true);
    assignments.forEach((assignment, index) => {
      const newParticipantId = originalAssignments[1 - index].participantId;
      assignment.qualifier = originalAssignments[1 - index].qualifier;
      assignment.participantId = newParticipantId;
    });
  }

  return { ...SUCCESS };
}
