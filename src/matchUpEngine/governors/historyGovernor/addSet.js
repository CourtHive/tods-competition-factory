import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';

export function addSet({ matchUp, set }) {
  // TODO: check set validity
  if (typeof set !== 'object') return { error: MISSING_VALUE };

  // do not destructure undoHistory; it is destroyed when adding to history
  const { history = [] } = getHistory({ matchUp });
  history.push(set);

  return saveHistory({ matchUp, history });
}
