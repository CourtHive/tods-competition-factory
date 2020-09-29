import { numericSort } from '../../../utilities';
import { findMatchUp } from '../../getters/getMatchUps';
import { SUCCESS } from '../../../constants/resultConstants';

export function assignMatchUpDrawPosition({
  drawDefinition,
  matchUpId,
  drawPosition,
}) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });

  let positionAssigned = false;
  matchUp.drawPositions = matchUp.drawPositions
    .map(position => {
      if (!position && !positionAssigned) {
        positionAssigned = true;
        return drawPosition;
      } else if (position === drawPosition) {
        positionAssigned = true;
        return drawPosition;
      } else {
        return position;
      }
    })
    .sort(numericSort);

  return positionAssigned
    ? SUCCESS
    : { error: 'No unfilled positions to assign' };
}

export function removeMatchUpDrawPosition({
  drawDefinition,
  matchUpId,
  drawPosition,
}) {
  const { matchUp } = findMatchUp({ drawDefinition, matchUpId });

  let positionRemoved = false;
  matchUp.drawPositions = matchUp.drawPositions.map(existingDrawPosition => {
    if (existingDrawPosition === drawPosition) {
      positionRemoved = true;
      return undefined;
    } else {
      return existingDrawPosition;
    }
  });

  return positionRemoved
    ? SUCCESS
    : { error: 'Not removed: drawPosition not found' };
}
