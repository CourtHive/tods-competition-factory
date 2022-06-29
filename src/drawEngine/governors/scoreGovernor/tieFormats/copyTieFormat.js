import { makeDeepCopy } from '../../../../utilities';

export function copyTieFormat(tieFormat) {
  return makeDeepCopy(tieFormat, false, true);
}
