import { getStructureSeedAssignments } from '../../../query/structure/getStructureSeedAssignments';
import { modifySeedAssignmentsNotice } from '../../../mutate/notifications/drawNotifications';
import { findStructure } from '../../../acquire/findStructure';
import { ensureInt } from '../../../utilities/ensureInt';
import { isNumeric } from '../../../utilities/math';

import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';
import {
  DrawDefinition,
  Event,
  Tournament,
} from '../../../types/tournamentTypes';

type ModifySeedAssignmentArgs = {
  tournamentRecord?: Tournament;
  drawDefinition: DrawDefinition;
  seedValue?: string | number;
  participantId: string;
  validation?: boolean;
  structureId: string;
  event?: Event;
};
export function modifySeedAssignment({
  validation = true,
  tournamentRecord,
  drawDefinition,
  participantId,
  structureId,
  seedValue,
  event,
}: ModifySeedAssignmentArgs) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!structureId) return { error: MISSING_STRUCTURE_ID };

  const { structure } = findStructure({ drawDefinition, structureId });
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const validValue =
    !validation ||
    isNumeric(seedValue) ||
    seedValue === undefined ||
    seedValue === '' ||
    (typeof seedValue === 'string' &&
      seedValue.split('-').every((v) => isNumeric(v) && ensureInt(v) > 0));

  if (!validValue) return { error: INVALID_VALUES };

  const { seedAssignments } = getStructureSeedAssignments({
    drawDefinition,
    structure,
  });
  const seedNumbers = seedAssignments?.map(
    (assignment) => assignment.seedNumber
  );

  const existingAssginment = seedAssignments?.find(
    (assignment) => assignment.participantId === participantId
  );

  if (existingAssginment) {
    const newValue =
      typeof seedValue === 'string'
        ? (seedValue.includes('-') &&
            seedValue
              .split('-')
              .map((v) => parseInt(v))
              .join('-')) ||
          (parseInt(seedValue) > 0 && parseInt(seedValue)) ||
          ''
        : (seedValue && seedValue > 0 && seedValue) || '';
    existingAssginment.seedValue = newValue;
  } else {
    const seedNumber = Math.max(0, ...(seedNumbers || [])) + 1;
    const seedAssignment: any = { seedNumber, participantId };
    if (seedValue) seedAssignment.seedValue = seedValue;
    if (!structure.seedAssignments) structure.seedAssignments = [];
    structure.seedAssignments.push(seedAssignment);
  }

  modifySeedAssignmentsNotice({
    tournamentId: tournamentRecord?.tournamentId,
    eventId: event?.eventId,
    drawDefinition,
    structure,
  });

  return { ...SUCCESS };
}
