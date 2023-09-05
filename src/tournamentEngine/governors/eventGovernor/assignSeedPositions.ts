import { getStructureSeedAssignments } from '../../../drawEngine/getters/getStructureSeedAssignments';
import { assignSeed } from '../../../drawEngine/governors/entryGovernor/seedAssignment';
import { uniqueValues } from '../../../utilities/arrays';

import { ResultType } from '../../../global/functions/decorateResult';
import { SUCCESS } from '../../../constants/resultConstants';
import { SeedingProfile } from '../../../types/factoryTypes';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_DRAW_ID,
  MISSING_ASSIGNMENTS,
  NO_MODIFICATIONS_APPLIED,
  INVALID_PARTICIPANT_SEEDING,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  SeedAssignment,
  Tournament,
} from '../../../types/tournamentFromSchema';

/*
 * Provides the ability to assign seedPositions *after* a structure has been generated
 * To be used *before* participants are positioned
 */

type AssignSeedPositionsArgs = {
  provisionalPositioning?: boolean;
  useExistingSeedLimit?: boolean;
  seedingProfile?: SeedingProfile;
  assignments: SeedAssignment[];
  tournamentRecord: Tournament;
  drawDefinition: DrawDefinition;
  structureId: string;
  drawId: string;
  event: Event;
};
export function assignSeedPositions(
  params: AssignSeedPositionsArgs
): ResultType | { modifications?: number; success?: boolean } {
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
    ...(seedAssignments || [])
      .filter((assignment) => assignment.seedNumber)
      .map((assignment) => ({ [assignment.seedNumber]: assignment }))
  );

  assignments.forEach((newAssignment) => {
    const { seedNumber } = newAssignment;
    if (
      seedLimit &&
      seedNumber <= seedLimit &&
      (!useExistingSeedLimit || mergeObject[seedNumber])
    ) {
      mergeObject[seedNumber] = newAssignment;
    }
  });

  /**
   * ensure that no participantId is assigned to multiple seedNumbers
   */
  const updatedAssignments: any[] = Object.values(mergeObject);
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
