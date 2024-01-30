import { makeDeepCopy } from '@Tools/makeDeepCopy';

import { TieFormat } from '@Types/tournamentTypes';

export function copyTieFormat(tieFormat?: TieFormat) {
  if (!tieFormat) return undefined;
  return makeDeepCopy(tieFormat, false, true);
}
