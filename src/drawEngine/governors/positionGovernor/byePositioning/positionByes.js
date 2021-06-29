import { getAppliedPolicies } from '../../policyGovernor/getAppliedPolicies';
import { getSeedOrderByePositions } from './getSeedOrderedByePositions';
import { getUnseededByePositions } from './getUnseededByePositions';
import { assignDrawPositionBye } from './assignDrawPositionBye';
import { findStructure } from '../../../getters/findStructure';
import { getByesData } from '../../../getters/getByesData';

import { SUCCESS } from '../../../../constants/resultConstants';

export function positionByes({
  blockOrdered = false,
  drawDefinition,
  structureId,
  structure,
  seedsOnly,

  matchUpsMap,
}) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { byesCount, placedByes, relevantMatchUps } = getByesData({
    drawDefinition,
    structure,

    matchUpsMap,
  });

  const byesToPlace = byesCount - placedByes;
  if (byesToPlace <= 0) return SUCCESS;

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const { isFeedIn, strictSeedOrderByePositions, blockSeedOrderByePositions } =
    getSeedOrderByePositions({
      structure,
      drawDefinition,
      appliedPolicies,
      relevantMatchUps,
    });

  const seedOrderByePositions = blockOrdered
    ? blockSeedOrderByePositions
    : strictSeedOrderByePositions;

  const { unseededByePositions } = getUnseededByePositions({
    appliedPolicies,
    structure,
    isFeedIn,
  });
  // first add all drawPositions paired with sorted seeds drawPositions
  // then add quarter separated dnd evenly distributed drawPositions
  // derived from theoretical seeding of firstRoundParticipants/2
  const byePositions = [].concat(
    ...seedOrderByePositions,
    ...(seedsOnly ? [] : unseededByePositions)
  );

  // then take only the number of required byes
  const byeDrawPositions = byePositions.slice(0, byesToPlace);

  for (const drawPosition of byeDrawPositions) {
    const result = assignDrawPositionBye({
      drawDefinition,
      structureId,
      drawPosition,

      matchUpsMap,
    });
    if (result?.error) return result;
  }

  return SUCCESS;
}
