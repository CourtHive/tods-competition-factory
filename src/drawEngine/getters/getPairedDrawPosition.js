export function getPairedDrawPosition({ matchUps, drawPosition }) {
  let targetMatchUp;
  const pairedDrawPosition = matchUps
    .filter(({ roundNumber }) => roundNumber === 1)
    .reduce((pairedDrawPosition, matchUp) => {
      const { drawPositions } = matchUp;
      const includesDrawPosition = drawPositions?.includes(drawPosition);
      if (includesDrawPosition) targetMatchUp = matchUp;
      return includesDrawPosition
        ? drawPositions.reduce(
            (p, c) => (c !== drawPosition ? c : p),
            undefined
          )
        : pairedDrawPosition;
    }, undefined);
  return { matchUp: targetMatchUp, pairedDrawPosition };
}
