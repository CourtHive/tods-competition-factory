import { getSeedOrderByePositions } from './getSeedOrderedByePositions';
import { getDevContext } from '../../../../global/state/globalState';
import { getUnseededByePositions } from './getUnseededByePositions';
import { assignDrawPositionBye } from './assignDrawPositionBye';
import { findStructure } from '../../../getters/findStructure';
import { getByesData } from '../../../getters/getByesData';
import { shuffleArray } from '../../../../utilities';

import { CONTAINER, ITEM } from '../../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../../constants/resultConstants';

export function positionByes({
  blockOrdered = false,
  tournamentRecord,
  appliedPolicies,
  drawDefinition,
  seedBlockInfo,
  matchUpsMap,
  structureId,
  structure,
  seedLimit,
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
    seedBlockInfo,
    structure,
  });

  const ignoreSeededByes =
    [CONTAINER, ITEM].includes(structure.structureType) &&
    appliedPolicies?.seeding?.containerByesIgnoreSeeding;
  const seedOrderByePositions = blockOrdered
    ? blockSeedOrderByePositions
    : strictSeedOrderByePositions;

  let { unseededByePositions } = getUnseededByePositions({
    ignoreSeededByes,
    appliedPolicies,
    drawDefinition,
    seedLimit,
    structure,
    isFeedIn,
    isLucky,
  });

  const isOdd = (x) => x % 2;
  // method determines whether candidate c is paired to elements in an array
  const isNotPaired = (arr = [], c) =>
    arr.every((a) => (isOdd(a) ? c !== a + 1 : c !== a - 1));

  // first add all drawPositions paired with sorted seeds drawPositions
  // then add quarter separated and evenly distributed drawPositions
  // derived from theoretical seeding of firstRoundParticipants
  // HOWEVER, if separated and evenly distributed drawPositions result
  // in a BYE/BYE pairing, prioritize remaining unpaired positions
  let byePositions = [].concat(...seedOrderByePositions);

  if (!seedsOnly) {
    while (unseededByePositions.length) {
      const unPairedPosition = unseededByePositions.find((position) =>
        isNotPaired(byePositions, position)
      );
      if (unPairedPosition) {
        byePositions.push(unPairedPosition);
        unseededByePositions = unseededByePositions.filter(
          (position) => position !== unPairedPosition
        );
      } else {
        byePositions.push(...unseededByePositions);
        unseededByePositions = [];
      }
    }
  }

  if (ignoreSeededByes) {
    byePositions = shuffleArray(byePositions);
    if (getDevContext({ ignoreSeededByes })) console.log({ byePositions });
  }

  // then take only the number of required byes
  let byeDrawPositions = byePositions.slice(0, byesToPlace);

  for (const drawPosition of byeDrawPositions) {
    const result = assignDrawPositionBye({
      tournamentRecord,
      drawDefinition,
      seedBlockInfo,
      drawPosition,
      matchUpsMap,
      structureId,
      structure,
      event,
    });
    if (result?.error) return result;
  }

  return { ...SUCCESS, unseededByePositions, byeDrawPositions };
}
