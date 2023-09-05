import { TieFormat } from '../../../types/tournamentFromSchema';
import { makeDeepCopy } from '../../../utilities';

export function copyTieFormat(tieFormat?: TieFormat) {
  if (!tieFormat) return undefined;
  return makeDeepCopy(tieFormat, false, true);
}
