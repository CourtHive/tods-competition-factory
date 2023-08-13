import { getPairedPreviousMatchUp } from '../positionGovernor/getPairedPreviousMatchup';

import { MatchUp } from '../../../types/tournamentFromSchema';

type UpdateMatchUpStatusCodesArgs = {
  inContextDrawMatchUps: any[];
  sourceMatchUpStatus: string;
  sourceMatchUpId: string;
  matchUpsMap: object;
  matchUp: MatchUp;
};

export function updateMatchUpStatusCodes({
  inContextDrawMatchUps,
  sourceMatchUpStatus,
  sourceMatchUpId,
  matchUpsMap,
  matchUp,
}: UpdateMatchUpStatusCodesArgs): undefined {
  // find sourceMatchUp and matchUp paired with sourceMatchUp to workout sourceSideNumber
  const sourceMatchUp = inContextDrawMatchUps.find(
    (matchUp) => matchUp.matchUpId === sourceMatchUpId
  );
  const { pairedPreviousMatchUp } = getPairedPreviousMatchUp({
    structureId: sourceMatchUp?.structureId,
    matchUp: sourceMatchUp,
    matchUpsMap,
  });
  if (sourceMatchUp && pairedPreviousMatchUp) {
    const pairedPreviousMatchUpId = pairedPreviousMatchUp?.matchUpId;
    const pairedMatchUp = inContextDrawMatchUps.find(
      (matchUp) => matchUp.matchUpId === pairedPreviousMatchUpId
    );
    const sourceSideNumber =
      sourceMatchUp?.structureId === pairedMatchUp?.structureId
        ? // if structureIds are equivalent then sideNumber is inferred from roundPositions
          (sourceMatchUp?.roundPosition < pairedMatchUp?.roundPosition && 1) ||
          2
        : // if different structureIds then structureId that is not equivalent to noContextWinnerMatchUp.structureId is fed
          // ... and fed positions are always sideNumber 1
          (sourceMatchUp.structureId === pairedMatchUp?.structureId && 2) || 1;

    matchUp.matchUpStatusCodes = (matchUp.matchUpStatusCodes ?? []).map(
      (code) => {
        if (code.sideNumber === sourceSideNumber) {
          return { ...code, previousMatchUpStatus: sourceMatchUpStatus };
        }
        return code;
      }
    );
  }
}