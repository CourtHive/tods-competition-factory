import { TieFormat } from '../../../types/tournamentFromSchema';
import { makeDeepCopy } from '../../../utilities';

export function copyTieFormat(tieFormat: TieFormat) {
  return makeDeepCopy(tieFormat, false, true);
}
