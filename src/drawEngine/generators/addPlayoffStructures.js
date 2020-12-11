import { getStructureRoundProfile } from '../getters/getMatchUps/getStructureRoundProfile';

import { MISSING_DRAW_DEFINITION } from '../../constants/errorConditionConstants';
import { unique } from '../../utilities';

export function addPlayoffStructures({
  drawDefinition,
  structureId,
  playoffPositions,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  const { roundProfile, roundMatchUps } = getStructureRoundProfile({
    drawDefinition,
    structureId,
  });
  const fpr = Object.values(roundProfile)
    .map(v => [
      unique(v.finishingPositionRange.loser),
      unique(v.finishingPositionRange.winner),
    ])
    .flat();
  console.log(fpr);
}
