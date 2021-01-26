export function removeSubsequentRoundsParticipant({
  mappedMatchUps,
  structureId,
  roundNumber,
  targetDrawPosition,
}) {
  const relevantMatchUps = mappedMatchUps[structureId].matchUps.filter(
    (matchUp) => matchUp.roundNumber >= roundNumber
  );
  relevantMatchUps.forEach(
    (matchUp) =>
      (matchUp.drawPositions = (matchUp.drawPositions || []).map(
        (drawPosition) => {
          return drawPosition === targetDrawPosition ? undefined : drawPosition;
        }
      ))
  );
}
