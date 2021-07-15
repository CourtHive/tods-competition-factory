export function getWalkoverWinningSide({
  inContextDrawMatchUps,
  matchUpId,
  drawPosition,
}) {
  // determine which sideNumber { drawPosition } will be and assign winningSide
  // NOTE: at present this is dependent on presence of .winnerMatchUpId and .loserMatchUpId
  // TODO: reusable function that will be able to use position targeting using links
  // which will need to filter by previous round then get positionTargets for each matchUp in the round

  // IMPORTANT: sourceMatchUps need to be sorted by roundPosition
  const sourceMatchUps = inContextDrawMatchUps
    .filter(
      ({ winnerMatchUpId, loserMatchUpId }) =>
        loserMatchUpId === matchUpId || winnerMatchUpId === matchUpId
    )
    .sort((a, b) => a.roundPosition - b.roundPosition);

  const feedRound = sourceMatchUps.find(({ feedRound }) => feedRound);
  return feedRound
    ? 1
    : sourceMatchUps.reduce((sideNumber, sourceMatchUp, index) => {
        if (sourceMatchUp.drawPositions.includes(drawPosition))
          return index + 1;
        return sideNumber;
      }, undefined);
}
