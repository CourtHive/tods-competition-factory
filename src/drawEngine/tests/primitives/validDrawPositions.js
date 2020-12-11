export function validDrawPositions({ matchUps, devContext }) {
  const drawPositions = matchUps.map(matchUp => matchUp.drawPositions).flat();

  if (devContext) {
    matchUps.forEach(matchUp => {
      matchUp.drawPositions.forEach(drawPosition => {
        if (!validDrawPosition(drawPosition)) {
          console.log('invalid drawPosition', matchUp);
        }
      });
    });
  }
  return drawPositions.reduce((valid, drawPosition) => {
    return validDrawPosition(drawPosition) && valid;
  }, true);
}

function validDrawPosition(drawPosition) {
  const isValid =
    drawPosition !== null &&
    (drawPosition === undefined || !isNaN(drawPosition));
  return isValid;
}
