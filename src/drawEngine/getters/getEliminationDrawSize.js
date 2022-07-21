import { decorateResult } from '../../global/functions/decorateResult';
import { nextPowerOf2 } from '../../utilities';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

export function getEliminationDrawSize({ participantCount }) {
  if (!participantCount) return { error: INVALID_VALUES };
  const drawSize = nextPowerOf2(participantCount);
  if (!drawSize)
    return decorateResult({
      result: { error: INVALID_VALUES },
      stack: 'getEliminationDrawSize',
      context: { participantCount },
    });
  return { drawSize };
}
