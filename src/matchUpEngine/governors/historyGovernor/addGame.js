import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

import { MISSING_VALUE } from '../../../constants/errorConditionConstants';

export function addGame({ matchUp, game }) {
  // TODO: check game validity
  if (typeof point !== 'object') return { error: MISSING_VALUE };

  // do not destructure undoHistory; it is destroyed when adding to history
  const { history = [] } = getHistory({ matchUp });
  history.push(game);

  return saveHistory({ matchUp, history });
}
