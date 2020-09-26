import { findEvent } from '../../getters/eventGetter';
import { SUCCESS } from '../../../constants/resultConstants';
import { uniqueValues } from '../../../utilities/arrays';

interface Assignment {
  seedValue?: string;
  seedNumber: number;
  participantId: string;
}

interface SeedAssignmentProps {
  tournamentRecord: any;
  policies?: any;
  drawEngine: any;
  drawId: string;
  eventId?: string;
  structureId?: string;
  stage?: string;
  stageSequence?: number;
  assignments: Assignment[];
  useExistingSeedLimit: boolean /* option to restrict assignments to existing seedNumbers */;
}

export function assignSeedPositions(props: SeedAssignmentProps) {
  const {
    tournamentRecord,
    drawEngine,
    policies,
    eventId,
    drawId,
    structureId,
    stage,
    stageSequence,
    assignments,
    useExistingSeedLimit,
  } = props;

  let modifications = 0;

  if (!assignments?.length) return { error: 'Missing assignments' };
  if (!tournamentRecord) return { error: 'Missing tournamentRecord' };
  if (!drawId) return { error: 'Missing drawId' };

  const { drawDefinition } = findEvent({
    tournamentRecord,
    eventId,
    drawId,
  });

  drawEngine.setState(drawDefinition);
  const existingSeedAssginments = drawEngine.getSeedAssignments({
    drawDefinition,
    stage,
    stageSequence,
    structureId,
  });

  if (!existingSeedAssginments.length) {
    return { error: 'draw sructure not found' };
  }
  if (existingSeedAssginments.length > 1) {
    return { error: 'Insufficient detail to determine structure' };
  }

  const {
    seedLimit,
    seedAssignments,
    structureId: identifiedStructureId,
  } = existingSeedAssginments[0];
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
      policies,
      ...assignment,
      drawDefinition,
      structureId: identifiedStructureId,
    });
    if (result?.success) modifications++;
  });

  return modifications ? SUCCESS : { error: 'No modifications applied ' };
}
