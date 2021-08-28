import { addAdHocMatchUps } from '../governors/structureGovernor/addAdHocMatchUps';
import { isConvertableInteger } from '../../utilities/math';
import { generateRange, UUID } from '../../utilities';

import { ROUND_OUTCOME } from '../../constants/drawDefinitionConstants';
import { TO_BE_PLAYED } from '../../constants/matchUpStatusConstants';
import { SUCCESS } from '../../constants/resultConstants';
import {
  INVALID_VALUES,
  INVALID_STRUCTURE,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
} from '../../constants/errorConditionConstants';

export function generateAdHocMatchUps({
  drawDefinition,
  structureId,

  addMatchUps = false,
  matchUpsCount = 1,
  matchUpIds = [],

  roundNumber,
  newRound,
}) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (!isConvertableInteger(matchUpsCount) || !Array.isArray(matchUpIds))
    return { error: INVALID_VALUES };

  // if drawDefinition and structureId are provided it is possible to infer roundNumber
  const structure = drawDefinition?.structures?.find(
    (structure) => structure.structureId === structureId
  );

  let structureHasRoundPositions;
  const existingMatchUps = structure?.matchUps;
  const lastRoundNumber = existingMatchUps.reduce((roundNumber, matchUp) => {
    if (matchUp.roundPosition) structureHasRoundPositions = true;
    return matchUp.roundNumber > roundNumber
      ? matchUp.roundNumber
      : roundNumber;
  }, 0);

  // structure must not be a container of other structures
  // structure must not contain matchUps with roundPosition
  // structure must not determine finishingPosition by ROUND_OUTCOME
  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  if (roundNumber && roundNumber - 1 > lastRoundNumber)
    return { error: INVALID_VALUES };

  const nextRoundNumber =
    roundNumber || (newRound ? lastRoundNumber + 1 : lastRoundNumber || 1);

  const matchUps = generateRange(0, matchUpsCount).map(() => ({
    matchUpId: matchUpIds.pop() || UUID(),
    roundNumber: nextRoundNumber,
    matchUpStatus: TO_BE_PLAYED,
    drawPositions: [],
  }));

  if (addMatchUps) {
    const result = addAdHocMatchUps({ drawDefinition, structureId, matchUps });
    if (result.error) return result;
  }

  return { matchUps, ...SUCCESS };
}
