import { nextPowerOf2 } from '../../utilities';
import {
  ResultType,
  decorateResult,
} from '../../global/functions/decorateResult';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

type GetDrawSizeArgs = {
  participantCount: number;
};
export function getEliminationDrawSize({
  participantCount,
}: GetDrawSizeArgs): ResultType | { drawSize: number } {
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
