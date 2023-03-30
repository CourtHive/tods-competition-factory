import { setMatchUpStatus } from './setMatchUpStatus';

import { MISSING_DRAW_DEFINITION } from '../../../constants/errorConditionConstants';

export function enableTieAutoCalc({
  tournamentRecord,
  drawDefinition,
  matchUpId,
  event,
}) {
  if (!drawDefinition) return { error: MISSING_DRAW_DEFINITION };

  return setMatchUpStatus({
    enableAutoCalc: true,
    tournamentRecord,
    drawDefinition,
    matchUpId,
    event,
  });
}
