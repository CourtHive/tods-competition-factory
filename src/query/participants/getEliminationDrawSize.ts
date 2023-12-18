import { nextPowerOf2 } from '../../utilities';
import {
  ResultType,
  decorateResult,
} from '../../global/functions/decorateResult';

import { INVALID_VALUES } from '../../constants/errorConditionConstants';

type GetDrawSizeArgs = {
  participantsCount?: number;
  participantCount?: number;
};
export function getEliminationDrawSize({
  participantsCount,
  participantCount, // TODO: to be deprecated
}: GetDrawSizeArgs): ResultType & { drawSize?: number } {
  participantsCount = participantsCount || participantCount;
  if (!participantsCount) return { error: INVALID_VALUES };

  const drawSize = nextPowerOf2(participantsCount);

  if (!drawSize)
    return decorateResult({
      result: { error: INVALID_VALUES },
      stack: 'getEliminationDrawSize',
      context: { participantsCount },
    });

  return { drawSize };
}
