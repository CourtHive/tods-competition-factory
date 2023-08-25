import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';

export function addShot({ matchUp, shot }) {
  // TODO: check game validity
  if (typeof shot !== 'object') return { error: MISSING_VALUE };

  // do not destructure undoHistory; it is destroyed when adding to history
  const { history = [] } = getHistory({ matchUp });
  history.push(shot);

  return saveHistory({ matchUp, history });
}
