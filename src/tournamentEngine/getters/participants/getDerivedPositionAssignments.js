import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';

export function getDerivedPositionAssignments({
  derivedDrawInfo,
  participantId,
  drawId,
}) {
  const mainPositionAssignment = derivedDrawInfo[
    drawId
  ]?.mainPositionAssignments?.find(
    (assignment) => assignment.participantId === participantId
  );
  const qualifyingPositionAssignment = derivedDrawInfo[
    drawId
  ]?.qualifyingPositionAssignments?.find(
    (assignment) => assignment.participantId === participantId
  );

  const positionAssignments = {};

  if (mainPositionAssignment) {
    const { participantId, ...props } = mainPositionAssignment;
    if (participantId) positionAssignments[MAIN] = { ...props };
  }
  if (qualifyingPositionAssignment) {
    const { participantId, ...props } = qualifyingPositionAssignment;
    if (participantId) positionAssignments[QUALIFYING] = { ...props };
  }

  return Object.keys(positionAssignments).length
    ? positionAssignments
    : undefined;
}
