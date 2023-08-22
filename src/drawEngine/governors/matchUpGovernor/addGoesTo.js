import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { addFinishingRounds } from '../../generators/addFinishingRounds';
import { positionTargets } from '../positionGovernor/positionTargets';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

export function addGoesTo({
  inContextDrawMatchUps,
  drawDefinition,
  matchUpsMap,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const goesToMap = { loserMatchUpIds: {}, winnerMatchUpIds: [] };

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps, matchUpsMap } = getAllDrawMatchUps({
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  const hasFinishingPositionRanges = matchUpsMap.drawMatchUps.some(
    (m) => m.finishingPositionRange
  );

  // NOTE: handles drawDefinitions in TODS files not generated by the factory
  // IF: there is only one structure present... as is the case with tods-xls-converter
  // TODO: make a more sophisticated version which can use .links to addFinishingRounds for all structures
  if (
    !hasFinishingPositionRanges &&
    drawDefinition.structures.length === 1 &&
    !drawDefinition.structures[0].structures
  ) {
    addFinishingRounds({ matchUps: matchUpsMap.drawMatchUps });
  }

  (inContextDrawMatchUps || [])
    .filter(({ collectionId }) => !collectionId)
    .forEach((inContextMatchUp) => {
      const { matchUpId, structureId } = inContextMatchUp;
      const targetData = positionTargets({
        inContextDrawMatchUps,
        drawDefinition,
        matchUpId,
      });
      const { winnerMatchUp, loserMatchUp } = targetData.targetMatchUps;
      const winnerMatchUpId = winnerMatchUp?.matchUpId;
      const loserMatchUpId = loserMatchUp?.matchUpId;

      const matchUps = getMappedStructureMatchUps({
        matchUpsMap,
        structureId,
      });
      const matchUp = matchUps.find(
        (matchUp) => matchUp.matchUpId === matchUpId
      );

      if (matchUp) {
        if (winnerMatchUpId) {
          goesToMap.winnerMatchUpIds[matchUp.matchUpId] = winnerMatchUpId;
          Object.assign(matchUp, { winnerMatchUpId });
          Object.assign(inContextMatchUp, { winnerMatchUpId });
        }
        if (loserMatchUpId) {
          goesToMap.loserMatchUpIds[matchUp.matchUpId] = loserMatchUpId;
          inContextMatchUp.loserMatchUpId = loserMatchUpId;
          matchUp.loserMatchUpId = loserMatchUpId;

          if (inContextMatchUp.finishingPositionRange) {
            const loserRange = loserMatchUp.finishingPositionRange && [
              ...inContextMatchUp.finishingPositionRange.loser,
              ...loserMatchUp.finishingPositionRange.loser,
            ];
            const loser = loserRange && [
              Math.min(...loserRange),
              Math.max(...loserRange),
            ];
            inContextMatchUp.finishingPositionRange.loser = loser;
            matchUp.finishingPositionRange.loser = loser;
          }
        }
      }
    });

  return { inContextDrawMatchUps, goesToMap };
}
