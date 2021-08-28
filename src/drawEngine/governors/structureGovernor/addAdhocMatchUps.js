import { chunkArray, generateRange } from '../../../utilities';
import {
  addMatchUpsNotice,
  modifyDrawNotice,
} from '../../notifications/drawNotifications';

import { ROUND_OUTCOME } from '../../../constants/drawDefinitionConstants';
import { SUCCESS } from '../../../constants/resultConstants';
import {
  INVALID_STRUCTURE,
  INVALID_VALUES,
  MISSING_DRAW_DEFINITION,
  MISSING_STRUCTURE_ID,
  STRUCTURE_NOT_FOUND,
} from '../../../constants/errorConditionConstants';

export function addAdHocMatchUps({ drawDefinition, structureId, matchUps }) {
  if (typeof drawDefinition !== 'object')
    return { error: MISSING_DRAW_DEFINITION };
  if (typeof structureId !== 'string') return { error: MISSING_STRUCTURE_ID };

  if (!Array.isArray(matchUps)) return { error: INVALID_VALUES };

  const structure = drawDefinition.structures?.find(
    (structure) => structure.structureId === structureId
  );
  if (!structure) return { error: STRUCTURE_NOT_FOUND };

  const existingMatchUps = structure?.matchUps;
  const structureHasRoundPositions = existingMatchUps.find(
    (matchUp) => !!matchUp.roundPosition
  );

  if (
    structure.structures ||
    structureHasRoundPositions ||
    structure.finishingPosition === ROUND_OUTCOME
  ) {
    return { error: INVALID_STRUCTURE };
  }

  const existingDrawPositions = (structure.matchUps || [])
    .map(({ drawPositions }) => drawPositions)
    .flat()
    .sort((a, b) => a - b);
  const nextDrawPosition = Math.max(...existingDrawPositions, 0) + 1;

  const matchUpsCount = matchUps.length;
  const newDrawPositions = generateRange(
    nextDrawPosition,
    nextDrawPosition + matchUpsCount * 2
  );
  const newDrawPositionPairs = chunkArray(newDrawPositions, 2);
  matchUps.forEach(
    (matchUp, i) => (matchUp.drawPositions = newDrawPositionPairs[i])
  );

  structure.matchUps.push(...matchUps);

  const newPositionAssignments = newDrawPositions.map((drawPosition) => ({
    drawPosition,
  }));

  if (!structure.positionAssignments) structure.positionAssignments = [];
  structure.positionAssignments.push(...newPositionAssignments);

  addMatchUpsNotice({ drawDefinition, matchUps });
  modifyDrawNotice({ drawDefinition });

  return { ...SUCCESS };
}
