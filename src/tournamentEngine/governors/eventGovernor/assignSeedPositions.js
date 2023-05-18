import { getStructureSeedAssignments } from '../../../drawEngine/getters/getStructureSeedAssignments';
import { assignSeed } from '../../../drawEngine/governors/entryGovernor/seedAssignment';
import { uniqueValues } from '../../../utilities/arrays';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_DRAW_ID,
  MISSING_ASSIGNMENTS,
  NO_MODIFICATIONS_APPLIED,
  INVALID_PARTICIPANT_SEEDING,
} from '../../../constants/errorConditionConstants';

/*
 * Provides the ability to assign seedPositions *after* a structure has been generated
 * To be used *before* participants are positioned
 */
export function assignSeedPositions(params) {
  const {
    provisionalPositioning,
    useExistingSeedLimit,
    tournamentRecord,
    drawDefinition,
    seedingProfile,
    structureId,
    assignments,
    drawId,
    event,
  } = params;

  let modifications = 0;

  if (!assignments?.length) return { error: MISSING_ASSIGNMENTS };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };

  const result = getStructureSeedAssignments({
    provisionalPositioning,
    drawDefinition,
    structureId,
  });
  if (result.error) return result;
  const { seedAssignments, seedLimit } = result;

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
      error: INVALID_PARTICIPANT_SEEDING,
    };
  }

  for (const assignment of updatedAssignments) {
    const result = assignSeed({
      ...assignment,
      provisionalPositioning,
      tournamentRecord,
      drawDefinition,
      seedingProfile,
      structureId,
      event,
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
