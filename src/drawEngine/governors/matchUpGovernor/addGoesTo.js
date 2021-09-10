import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { positionTargets } from '../positionGovernor/positionTargets';

export function addGoesTo({
  drawDefinition,
  matchUpsMap,
  inContextDrawMatchUps,
}) {
  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps, matchUpsMap } = getAllDrawMatchUps({
      drawDefinition,
      inContext: true,
      includeByeMatchUps: true,

      matchUpsMap,
    }));
  }

  (inContextDrawMatchUps || []).forEach((inContextMatchUp) => {
    const { matchUpId, structureId } = inContextMatchUp;
    const targetData = positionTargets({
      matchUpId,
      drawDefinition,
      inContextDrawMatchUps,
    });
    const { winnerMatchUp, loserMatchUp } = targetData.targetMatchUps;
    const winnerMatchUpId = winnerMatchUp?.matchUpId;
    const loserMatchUpId = loserMatchUp?.matchUpId;

    const matchUps = getMappedStructureMatchUps({
      matchUpsMap,
      structureId,
    });
    const matchUp = matchUps.find((matchUp) => matchUp.matchUpId === matchUpId);

    if (winnerMatchUpId) {
      Object.assign(matchUp, { winnerMatchUpId });
    }
    if (loserMatchUpId) {
      Object.assign(matchUp, { loserMatchUpId });
    }
  });

  return { inContextDrawMatchUps };
}
