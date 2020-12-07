import { BYE } from '../../../constants/matchUpStatusConstants';

export function checkIfWinnerHadBye({
  sourceMatchUps,
  loserDrawPosition,
  drawPositionMatchUps,
}) {
  const sourceMatchUp = drawPositionMatchUps.reduce(
    (sourceMatchUp, matchUp) =>
      !sourceMatchUp || matchUp.roundNumber > sourceMatchUp.roundNumber
        ? matchUp
        : sourceMatchUp,
    undefined
  );
  const winnerDrawPosition = sourceMatchUp.drawPositions.find(
    drawPosition => drawPosition !== loserDrawPosition
  );
  return sourceMatchUps
    .filter(matchUp => matchUp.drawPositions.includes(winnerDrawPosition))
    .map(matchUp => matchUp.matchUpStatus)
    .includes(BYE);
}
