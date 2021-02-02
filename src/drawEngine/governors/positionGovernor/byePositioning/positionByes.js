import { getAppliedPolicies } from '../../policyGovernor/getAppliedPolicies';
import { getSeedOrderByePositions } from './getSeedOrderedByePositions';
import { getUnseededByePositions } from './getUnseededByePositions';
import { assignDrawPositionBye } from './assignDrawPositionBye';
import { findStructure } from '../../../getters/findStructure';
import { getByesData } from '../../../getters/getByesData';

import { SUCCESS } from '../../../../constants/resultConstants';
import { BYES_LIMIT_REACHED } from '../../../../constants/errorConditionConstants';

export function positionByes({
  drawDefinition,
  mappedMatchUps,
  structure,
  structureId,
  blockOrdered = false,
}) {
  if (!structure)
    ({ structure } = findStructure({ drawDefinition, structureId }));
  if (!structureId) ({ structureId } = structure);

  const { byesCount, placedByes, relevantMatchUps } = getByesData({
    drawDefinition,
    mappedMatchUps,
    structure,
  });

  const byesToPlace = byesCount - placedByes;
  if (byesToPlace < 0) {
    console.log('Too many BYEs playced');
    return { error: BYES_LIMIT_REACHED };
  }
  if (byesToPlace === 0) return SUCCESS;

  const { appliedPolicies } = getAppliedPolicies({ drawDefinition });
  const {
    isFeedIn,
    strictSeedOrderByePositions,
    blockSeedOrderByePositions,
  } = getSeedOrderByePositions({
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
    ...unseededByePositions
  );

  // then take only the number of required byes
  const byeDrawPositions = byePositions.slice(0, byesToPlace);

  for (const drawPosition of byeDrawPositions) {
    const result = assignDrawPositionBye({
      drawDefinition,
      mappedMatchUps,
      structureId,
      drawPosition,
    });
    if (result?.error) return result;
  }

  return SUCCESS;
}
