import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';
// import { getPairedPreviousMatchUp } from './getPairedPreviousMatchup';

import { DOUBLE_WALKOVER } from '../../../constants/matchUpStatusConstants';

export function getPairedPreviousMatchUpIsWOWO(params) {
  let { sourceMatchUp } = params;
  const { winnerMatchUp, structure, matchUpsMap, drawPosition } = params;
  const previousRoundNumber =
    winnerMatchUp.roundNumber > 1 && winnerMatchUp.roundNumber - 1;

  const structureMatchUps = getMappedStructureMatchUps({
    structureId: structure.structureId,
    matchUpsMap,
  });

  if (!sourceMatchUp && drawPosition) {
    sourceMatchUp = structureMatchUps.find(
      ({ drawPositions, roundNumber }) =>
        roundNumber === previousRoundNumber &&
        drawPositions.includes(drawPosition)
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

  /*
  const { pairedPreviousMatchUp } = getPairedPreviousMatchUp({
    matchUp: sourceMatchUp,
    structureId: structure.structureId,
    matchUpsMap,
  });
  */
  const pairedPreviousMatchUpStatus = pairedPreviousMatchUp?.matchUpStatus;
  const pairedPreviousMatchUpisWOWO = [DOUBLE_WALKOVER].includes(
    pairedPreviousMatchUpStatus
  );
  return { pairedPreviousMatchUp, pairedPreviousMatchUpisWOWO };
}
