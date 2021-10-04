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
      includeByeMatchUps: true,
      inContext: true,
      drawDefinition,
      matchUpsMap,
    }));
  }

  (inContextDrawMatchUps || []).forEach((inContextMatchUp) => {
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
