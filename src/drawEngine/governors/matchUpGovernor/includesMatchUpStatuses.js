import { intersection } from '../../../utilities';

import {
  BYE,
  DEFAULTED,
  WALKOVER,
} from '../../../constants/matchUpStatusConstants';

export function includesMatchUpStatuses({
  sourceMatchUps,
  loserDrawPosition,
  drawPositionMatchUps,
  matchUpStatuses = [BYE, WALKOVER, DEFAULTED],
}) {
  const sourceMatchUp = drawPositionMatchUps.reduce(
    (sourceMatchUp, matchUp) =>
      !sourceMatchUp || matchUp.roundNumber > sourceMatchUp.roundNumber
        ? matchUp
        : sourceMatchUp,
    undefined
  );
  const winnerDrawPosition = sourceMatchUp.drawPositions.find(
    (drawPosition) => drawPosition !== loserDrawPosition
  );

  const winnerMatchUpStatuses = sourceMatchUps
    .filter((matchUp) => matchUp.drawPositions.includes(winnerDrawPosition))
    .map((matchUp) => matchUp.matchUpStatus);

  const loserMatchUpStatuses = sourceMatchUps
    .filter((matchUp) => matchUp.drawPositions.includes(loserDrawPosition))
    .map((matchUp) => matchUp.matchUpStatus);

  const winnerHadMatchUpStatus = !!intersection(
    winnerMatchUpStatuses,
    matchUpStatuses
  ).length;

  const loserHadMatchUpStatus = !!intersection(
    loserMatchUpStatuses,
    matchUpStatuses
  ).length;

  return {
    sourceMatchUp,
    winnerHadMatchUpStatus,
    winnerMatchUpStatuses,
    loserHadMatchUpStatus,
    loserMatchUpStatuses,
  };
}
