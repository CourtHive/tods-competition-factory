import { makeDeepCopy } from '../../../tools/makeDeepCopy';

import { TieFormat } from '../../../types/tournamentTypes';

export function copyTieFormat(tieFormat?: TieFormat) {
  if (!tieFormat) return undefined;
  return makeDeepCopy(tieFormat, false, true);
}
