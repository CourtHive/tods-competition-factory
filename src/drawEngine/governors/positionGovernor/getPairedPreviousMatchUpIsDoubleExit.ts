import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';

import {
  DOUBLE_DEFAULT,
  DOUBLE_WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function getPairedPreviousMatchUpIsDoubleExit(params) {
  let { sourceMatchUp } = params;
  const { targetMatchUp, structure, matchUpsMap, drawPosition } = params;

  const previousRoundNumber =
    targetMatchUp.roundNumber > 1 && targetMatchUp.roundNumber - 1;

  const structureMatchUps = getMappedStructureMatchUps({
    structureId: structure.structureId,
    matchUpsMap,
  });

  if (!sourceMatchUp && drawPosition) {
    sourceMatchUp = structureMatchUps.find(
      ({ drawPositions, roundNumber }) =>
        roundNumber === previousRoundNumber &&
        drawPositions?.includes(drawPosition)
    );
  }

  // look for paired round position in previous round
  // missing sourceMatchUp causes pairedRoundPosition to be NaN, which is OK
  const sourceRoundPosition = sourceMatchUp?.roundPosition;
  const offset = sourceRoundPosition % 2 ? 1 : -1;
  const pairedRoundPosition = sourceRoundPosition + offset;
  const pairedPreviousMatchUp =
    previousRoundNumber &&
    structureMatchUps.find(
      ({ roundNumber, roundPosition }) =>
        roundNumber === previousRoundNumber &&
        roundPosition === pairedRoundPosition
    );

  const pairedPreviousMatchUpStatus = pairedPreviousMatchUp?.matchUpStatus;
  const pairedPreviousMatchUpIsDoubleExit = [
    DOUBLE_WALKOVER,
    DOUBLE_DEFAULT,
  ].includes(pairedPreviousMatchUpStatus);

  return { pairedPreviousMatchUp, pairedPreviousMatchUpIsDoubleExit };
}
