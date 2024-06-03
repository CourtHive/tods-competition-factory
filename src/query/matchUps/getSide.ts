// Types
import { PositionAssignment, SeedAssignment } from '@Types/tournamentTypes';
import { HydratedSide } from '@Types/hydrated';

export function getSide({
  drawPositionCollectionAssignment,
  sideNumberCollectionAssignment,
  positionAssignments,
  displaySideNumber,
  seedAssignments,
  drawPosition,
  isFeedRound,
  sideNumber,
}: {
  positionAssignments: PositionAssignment[];
  drawPositionCollectionAssignment?: any;
  sideNumberCollectionAssignment?: any;
  seedAssignments?: SeedAssignment[];
  displaySideNumber: number;
  drawPosition?: number;
  isFeedRound: boolean;
  sideNumber: number;
}) {
  const assignment = positionAssignments.find(
    (assignment) => assignment.drawPosition && assignment.drawPosition === drawPosition,
  );
  const dpc = drawPosition && drawPositionCollectionAssignment;
  const snc = sideNumber && sideNumberCollectionAssignment;
  const participantId = dpc ? dpc[drawPosition]?.participantId : assignment?.participantId;

  const sideValue = assignment
    ? getSideValue({
        displaySideNumber,
        seedAssignments,
        participantId,
        assignment,
        sideNumber,
      })
    : { ...snc?.[sideNumber] };

  if (isFeedRound) {
    if (sideNumber === 1) {
      Object.assign(sideValue, { participantFed: true });
    } else {
      Object.assign(sideValue, { participantAdvanced: true });
    }
  }

  if (drawPosition && dpc) {
    const teamParticipant = dpc[drawPosition]?.teamParticipant;
    const participant = dpc[drawPosition]?.participant;
    const substitutions = dpc[drawPosition]?.substitutions;
    if (participant) sideValue.participant = participant;
    if (substitutions) sideValue.substitutions = substitutions;
    if (teamParticipant) sideValue.teamParticipant = teamParticipant;
  }

  return sideValue;
}

function getSideValue({ displaySideNumber, seedAssignments, participantId, assignment, sideNumber }) {
  const side: HydratedSide = {
    drawPosition: assignment.drawPosition,
    displaySideNumber,
    sideNumber,
  };
  if (participantId) {
    const seeding = getSeeding({ seedAssignments, participantId });
    Object.assign(side, seeding, { participantId });
    if (seeding?.seedNumber && seeding?.seedValue === '') {
      // if an empty string is returned, use a tilde to indicate a seed assignment has been removed
      side.seedValue = '~';
    }
  } else if (assignment.bye) {
    Object.assign(side, { bye: true });
  }

  if (assignment.qualifier) {
    Object.assign(side, { qualifier: true });
  }

  return side;
}

function getSeeding({ seedAssignments, participantId }) {
  return seedAssignments?.find((assignment) => !assignment.seedProxy && assignment.participantId === participantId);
}
