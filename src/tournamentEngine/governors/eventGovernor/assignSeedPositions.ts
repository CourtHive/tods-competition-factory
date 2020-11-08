import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { uniqueValues } from '../../../utilities/arrays';
import {
  MISSING_TOURNAMENT_RECORD,
  MISSING_DRAW_ID,
  MISSING_ASSIGNMENTS,
  NO_MODIFICATIONS_APPLIED,
} from '../../../constants/errorConditionConstants';

interface Assignment {
  seedValue?: string;
  seedNumber: number;
  participantId: string;
}

interface SeedAssignmentProps {
  tournamentRecord: any;
  drawEngine: any;
  drawId: string;
  eventId?: string;
  structureId?: string;
  stage?: string;
  stageSequence?: number;
  assignments: Assignment[];
  useExistingSeedLimit: boolean /* option to restrict assignments to existing seedNumbers */;
}

/*
 * Provides the ability to assign seedPositions *after* a structure has been generated
 * To be used *before* participants are positioned
 */
export function assignSeedPositions(props: SeedAssignmentProps) {
  const {
    tournamentRecord,
    drawEngine,
    eventId,
    drawId,
    structureId,
    assignments,
    useExistingSeedLimit,
  } = props;

  let modifications = 0;

  if (!assignments?.length) return { error: MISSING_ASSIGNMENTS };
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawId) return { error: MISSING_DRAW_ID };

  const { event, drawDefinition } = findEvent({
    tournamentRecord,
    eventId,
    drawId,
  });

  drawEngine.setState(drawDefinition);
  const {
    seedAssignments,
    seedLimit,
    error,
  } = drawEngine.getStructureSeedAssignments({
    drawDefinition,
    structureId,
  });

  const errors: string[] = [];
  if (error) errors.push(error);

  /**
   * mergeObject and seedLimit insure that new assignments do not go beyond already established number of seeds
   */
  const mergeObject = Object.assign(
    {},
    ...seedAssignments
      .filter(assignment => assignment.seedNumber)
      .map(assignment => ({ [assignment.seedNumber]: assignment }))
  );

  assignments.forEach(newAssignment => {
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
    .map((assignment: any) => assignment?.participantId)
    .filter(f => f);

  if (participantIds.length !== uniqueValues(participantIds).length) {
    return {
      error: 'participantId cannot be assigned to multiple seedNumbers',
    };
  }

  updatedAssignments.forEach((assignment: any) => {
    const result = drawEngine.assignSeed({
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

  if (modifications && event) {
    const { drawDefinition: updatedDrawDefinition } = drawEngine.getState();
    event.drawDefinitions = event.drawDefinitions.map(drawDefinition => {
      return drawDefinition.drawId === drawId
        ? updatedDrawDefinition
        : drawDefinition;
    });
  }

  return modifications
    ? SUCCESS
    : errors.length
    ? { error: NO_MODIFICATIONS_APPLIED, errors }
    : { error: NO_MODIFICATIONS_APPLIED };
}
