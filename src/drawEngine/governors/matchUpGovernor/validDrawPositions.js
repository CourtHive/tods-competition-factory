import { getDevContext } from '../../../global/globalState';

import { MISSING_MATCHUPS } from '../../../constants/errorConditionConstants';

export function validDrawPositions({ matchUps }) {
  if (!matchUps) return { error: MISSING_MATCHUPS };
  const drawPositions = matchUps.map((matchUp) => matchUp.drawPositions).flat();

  if (getDevContext()) {
    matchUps.forEach((matchUp) => {
      if (!Array.isArray(matchUp.drawPositions)) {
        console.log('drawPositions not an array', matchUp);
        return;
      }
      matchUp.drawPositions.forEach((drawPosition) => {
        if (!validDrawPosition(drawPosition)) {
          console.log('invalid drawPosition', matchUp);
        }
      });
    });
  }

  const allPositionsValid = drawPositions.every(validDrawPosition);

  const matchUpDrawPositionsNotArray = matchUps.find(
    (matchUp) => !Array.isArray(matchUp.drawPositions)
  );

  return allPositionsValid && !matchUpDrawPositionsNotArray;
}

function validDrawPosition(drawPosition) {
  const isValid =
    drawPosition !== null &&
    (drawPosition === undefined || !isNaN(drawPosition));
  return isValid;
}
