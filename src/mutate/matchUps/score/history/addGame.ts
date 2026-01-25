import { saveHistory } from './saveHistory';
import { getHistory } from './getHistory';

import { INVALID_VALUES } from '@Constants/errorConditionConstants';

export function addGame({ matchUp, game }) {
  if (typeof game !== 'object') return { error: INVALID_VALUES, context: { game } };

  // do not destructure undoHistory; it is destroyed when adding to history
  const { history = [] } = getHistory({ matchUp });
  history.push(game);

  return saveHistory({ matchUp, history });
}
