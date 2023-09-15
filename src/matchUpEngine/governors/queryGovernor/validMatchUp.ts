import { isConvertableInteger } from '../../../utilities/math';
import { isObject } from '../../../utilities/objects';

export function validMatchUp(matchUp) {
  if (!isObject(matchUp)) return false;
  const { matchUpId, drawPositions } = matchUp;
  const validMatchUpId = typeof matchUpId === 'string';
  const validDrawPositions =
    !drawPositions ||
    (Array.isArray(drawPositions) &&
      drawPositions.every((dp) => isConvertableInteger(dp)));
  return validMatchUpId && validDrawPositions;
}

export function validMatchUps(matchUps) {
  if (!Array.isArray(matchUps)) return false;
  return matchUps.every(validMatchUp);
}
