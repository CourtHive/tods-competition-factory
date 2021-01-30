import { getMatchUpsMap } from '../../getters/getMatchUps/getMatchUpsMap';

export function removeSubsequentRoundsParticipant({
  drawDefinition,
  mappedMatchUps,
  structureId,
  roundNumber,
  targetDrawPosition,
}) {
  if (!mappedMatchUps && !drawDefinition) {
    console.log('ERROR: missing params');
    return;
  }
  mappedMatchUps = mappedMatchUps || getMatchUpsMap({ drawDefinition });
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
