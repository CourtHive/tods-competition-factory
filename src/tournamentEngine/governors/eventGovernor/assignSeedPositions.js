import { uniqueValues } from '../../../utilities/arrays';
import { assignSeed } from '../../../drawEngine/governors/entryGovernor/seedAssignment';
import { getStructureSeedAssignments } from '../../../drawEngine/getters/getStructureSeedAssignments';

import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_DRAW_ID,
  MISSING_ASSIGNMENTS,
  NO_MODIFICATIONS_APPLIED,
} from '../../../constants/errorConditionConstants';
import { SUCCESS } from '../../../constants/resultConstants';

/*
 * Provides the ability to assign seedPositions *after* a structure has been generated
 * To be used *before* participants are positioned
 */
export function assignSeedPositions(props) {
  const {
    tournamentRecord,
    drawDefinition,
    drawId,
    structureId,
    assignments,
    useExistingSeedLimit,
  } = props;

  let modifications = 0;

  if (!assignments?.length) return { error: MISSING_ASSIGNMENTS };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };

  const { seedAssignments, seedLimit, error } = getStructureSeedAssignments({
    drawDefinition,
    structureId,
  });

  const errors = [];
  if (error) errors.push(error);

  /**
   * mergeObject and seedLimit insure that new assignments do not go beyond already established number of seeds
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
   * Insure that no participantId is assigned to multiple seedNumbers
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

  updatedAssignments.forEach((assignment) => {
    const result = assignSeed({
      ...assignment,
      drawDefinition,
      structureId,
    });
    if (result?.error) {
      modifications = 0;
      errors.push(result?.error);
    } else if (!errors.length && result?.success) {
      modifications++;
    }
  });

  return modifications
    ? SUCCESS
    : errors.length
    ? { error: NO_MODIFICATIONS_APPLIED, errors }
    : { error: NO_MODIFICATIONS_APPLIED };
}
