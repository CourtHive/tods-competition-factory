export function getPairedDrawPosition({ matchUps, drawPosition }) {
  return matchUps
    .filter(({ roundNumber }) => roundNumber === 1)
    .reduce((pairedDrawPosition, { drawPositions }) => {
      return drawPositions?.includes(drawPosition)
        ? drawPositions.reduce(
            (p, c) => (c !== drawPosition ? c : p),
            undefined
          )
        : pairedDrawPosition;
    }, undefined);
}
