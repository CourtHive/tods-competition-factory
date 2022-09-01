import { getSeedOrderByePositions } from './getSeedOrderedByePositions';
import { getUnseededByePositions } from './getUnseededByePositions';
import { assignDrawPositionBye } from './assignDrawPositionBye';
import { findStructure } from '../../../getters/findStructure';
import { getByesData } from '../../../getters/getByesData';
import { shuffleArray } from '../../../../utilities';

import { SUCCESS } from '../../../../constants/resultConstants';
import { getDevContext } from '../../../../global/state/globalState';

export function positionByes({
  blockOrdered = false,
  tournamentRecord,
  appliedPolicies,
  drawDefinition,
  seedBlockInfo,
  seedBlckInfo,
  matchUpsMap,
  structureId,
  structure,
  seedsOnly,
  event,
}) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { byesCount, placedByes, relevantMatchUps } = getByesData({
    drawDefinition,
    matchUpsMap,
    structure,
    event,
  });
  const byesToPlace = byesCount - placedByes;
  if (byesToPlace <= 0) return { ...SUCCESS };

  const {
    strictSeedOrderByePositions,
    blockSeedOrderByePositions,
    isFeedIn,
    isLucky,
  } = getSeedOrderByePositions({
    relevantMatchUps,
    appliedPolicies,
    drawDefinition,
    seedBlckInfo,
    structure,
  });

  const ignoreSeededByes = appliedPolicies?.seeding?.containerByesIgnoreSeeding;
  const seedOrderByePositions = blockOrdered
    ? blockSeedOrderByePositions
    : strictSeedOrderByePositions;

  const { unseededByePositions } = getUnseededByePositions({
    ignoreSeededByes,
    appliedPolicies,
    drawDefinition,
    seedBlckInfo,
    structure,
    isFeedIn,
    isLucky,
  });

  // first add all drawPositions paired with sorted seeds drawPositions
  // then add quarter separated and evenly distributed drawPositions
  // derived from theoretical seeding of firstRoundParticipants/2
  let byePositions = [].concat(
    ...seedOrderByePositions,
    ...(seedsOnly ? [] : unseededByePositions)
  );

  if (ignoreSeededByes) {
    byePositions = shuffleArray(byePositions);
    if (getDevContext({ ignoreSeededByes })) console.log({ byePositions });
  }

  // then take only the number of required byes
  const byeDrawPositions = byePositions.slice(0, byesToPlace);

  for (const drawPosition of byeDrawPositions) {
    const result = assignDrawPositionBye({
      tournamentRecord,
      drawDefinition,
      seedBlockInfo,
      drawPosition,
      matchUpsMap,
      structureId,
      structure,
    });
    if (result?.error) return result;
  }

  return { ...SUCCESS, unseededByePositions };
}
