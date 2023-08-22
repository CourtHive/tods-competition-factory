import { MAIN, QUALIFYING } from '../../../constants/drawDefinitionConstants';

export function getDerivedSeedAssignments({
  derivedDrawInfo,
  participantId,
  drawId,
}) {
  const mainSeedAssignment = derivedDrawInfo[drawId]?.mainSeedAssignments?.find(
    (assignment) => assignment.participantId === participantId
  );
  const qualifyingSeedAssignment = derivedDrawInfo[
    drawId
  ]?.qualifyingSeedAssignments?.find(
    (assignment) => assignment.participantId === participantId
  );
  const seedAssignments = {};
  if (mainSeedAssignment) {
    const { participantId, ...props } = mainSeedAssignment;
    if (participantId) seedAssignments[MAIN] = { ...props };
  }
  if (qualifyingSeedAssignment) {
    const { participantId, ...props } = qualifyingSeedAssignment;
    if (participantId) seedAssignments[QUALIFYING] = { ...props };
  }
  return Object.keys(seedAssignments).length ? seedAssignments : undefined;
}
