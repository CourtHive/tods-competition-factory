import { isConvertableInteger } from '../../../../utilities/math';
import { SUCCESS } from '../../../../constants/resultConstants';

import {
  INVALID_DRAW_POSITION,
  MISSING_DRAW_DEFINITION,
  MISSING_TOURNAMENT_RECORD,
} from '../../../../constants/errorConditionConstants';

export function removeSeededParticipant({
  tournamentRecord,
  drawDefinition,
  drawPosition,
}) {
  if (!tournamentRecord) return { error: MISSING_TOURNAMENT_RECORD };
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };
  if (!isConvertableInteger(drawPosition))
    return { error: INVALID_DRAW_POSITION };

  // TODO: implement rotation of seeded players

  return { ...SUCCESS };
}
