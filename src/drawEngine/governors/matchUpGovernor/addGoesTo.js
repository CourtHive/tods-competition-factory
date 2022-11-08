import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { positionTargets } from '../positionGovernor/positionTargets';

export function addGoesTo({
  inContextDrawMatchUps,
  drawDefinition,
  matchUpsMap,
}) {
  const goesToMap = { loserMatchUpIds: {}, winnerMatchUpIds: [] };

  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps, matchUpsMap } = getAllDrawMatchUps({
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
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
          Object.assign(matchUp, { loserMatchUpId });
          Object.assign(inContextMatchUp, { loserMatchUpId });
        }
      }
    });

  return { inContextDrawMatchUps, goesToMap };
}
