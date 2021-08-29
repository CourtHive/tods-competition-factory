import {
  DIRECT_ACCEPTANCE,
  ORGANISER_ACCEPTANCE,
  WILDCARD,
} from '../../../../constants/entryStatusConstants';

export function getAvailableAdHocParticipantIds({
  drawDefinition,
  drawPosition,
  structure,
}) {
  // In AdHoc draws a participant can be assigned to multiple drawPositions ...
  // ... because each round is unique ...
  // therfore, the targetMatchUp must be found...
  const targetMatchUp = structure?.matchUps?.find((matchUp) =>
    matchUp.drawPositions?.includes(drawPosition)
  );
  // ... so that the target roundNumber can be found ...
  const roundNumber = targetMatchUp?.roundNumber;
  // ... so that the round's drawPositions can be found ...
  const roundDrawPositions = structure?.matchUps
    ?.filter((matchUp) => matchUp.roundNumber === roundNumber)
    .map(({ drawPositions }) => drawPositions)
    .flat();
  // ... so that the round's assigned participantIds can be found ...
  const roundAssignedParticipantIds = structure?.positionAssignments
    ?.filter(
      ({ drawPosition, participantId }) =>
        roundDrawPositions.includes(drawPosition) && participantId
    )
    .map(({ participantId }) => participantId);

  const enteredParticipantIds = drawDefinition.entries
    .filter(({ entryStatus }) =>
      [DIRECT_ACCEPTANCE, ORGANISER_ACCEPTANCE, WILDCARD].includes(entryStatus)
    )
    .map(({ participantId }) => participantId);

  // AdHoc available participants are those entered in the draw who are not assigned to the target round
  const availableParticipantIds = enteredParticipantIds.filter(
    (participantId) => !roundAssignedParticipantIds.includes(participantId)
  );

  return availableParticipantIds;
}
