import { findStructure } from '../../getters/findStructure';
import { getAllDrawMatchUps } from '../../getters/getMatchUps/drawMatchUps';
import { getMappedStructureMatchUps } from '../../getters/getMatchUps/getMatchUpsMap';
import { positionTargets } from '../positionGovernor/positionTargets';

export function addGoesTo({
  drawDefinition,
  matchUpsMap,
  inContextDrawMatchUps,
}) {
  if (!inContextDrawMatchUps) {
    ({ matchUps: inContextDrawMatchUps } = getAllDrawMatchUps({
      drawDefinition,
      inContext: true,
      includeByeMatchUps: true,

      matchUpsMap,
    }));
  }

  (inContextDrawMatchUps || []).forEach((inContextMatchUp) => {
    const { matchUpId, structureId } = inContextMatchUp;
    const { structure } = findStructure({ drawDefinition, structureId });
    const targetData = positionTargets({
      matchUpId,
      structure,
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
