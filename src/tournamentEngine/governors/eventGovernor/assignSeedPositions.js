import { getStructureSeedAssignments } from '../../../drawEngine/getters/getStructureSeedAssignments';
import { assignSeed } from '../../../drawEngine/governors/entryGovernor/seedAssignment';
import { uniqueValues } from '../../../utilities/arrays';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_DRAW_ID,
  MISSING_ASSIGNMENTS,
  NO_MODIFICATIONS_APPLIED,
} from '../../../constants/errorConditionConstants';

/*
 * Provides the ability to assign seedPositions *after* a structure has been generated
 * To be used *before* participants are positioned
 */
export function assignSeedPositions(params) {
  const {
    useExistingSeedLimit,
    tournamentRecord,
    drawDefinition,
    structureId,
    assignments,
    drawId,
  } = params;

  let modifications = 0;

  if (!assignments?.length) return { error: MISSING_ASSIGNMENTS };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };

  const { seedAssignments, seedLimit, error } = getStructureSeedAssignments({
    drawDefinition,
    structureId,
  });
  if (error) return { error };

  /**
   * mergeObject and seedLimit ensure that new assignments do not go beyond already established number of seeds
   */
  const mergeObject = Object.assign(
    {},
    ...seedAssignments
      .filter((assignment) => assignment.seedNumber)
      .map((assignment) => ({ [assignment.seedNumber]: assignment }))
  );

  assignments.forEach((newAssignment) => {
    const { seedNumber } = newAssignment;
    if (
      seedNumber <= seedLimit &&
      (!useExistingSeedLimit || mergeObject[seedNumber])
    ) {
      mergeObject[seedNumber] = newAssignment;
    }
  });

  /**
   * ensure that no participantId is assigned to multiple seedNumbers
   */
  const updatedAssignments = Object.values(mergeObject);
  const participantIds = updatedAssignments
    .map((assignment) => assignment?.participantId)
    .filter(Boolean);

  if (participantIds.length !== uniqueValues(participantIds).length) {
    return {
      error: 'participantId cannot be assigned to multiple seedNumbers',
    };
  }

  for (const assignment of updatedAssignments) {
    const result = assignSeed({
      ...assignment,
      drawDefinition,
      structureId,
    });
    if (result?.error) {
      return result;
    } else if (result?.success) {
      modifications++;
    }
  }

  return modifications
    ? { ...SUCCESS, modifications }
    : { error: NO_MODIFICATIONS_APPLIED };
}
